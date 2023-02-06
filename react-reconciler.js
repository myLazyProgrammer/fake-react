let nextUnitOfWork = null;
let wipRoot = null;
let currentRoot = null;
let deletions = null;
let wipFiber = null;
let hookIndex = null;

const isEvent = key => {
  return key.startsWith('on')
};
const isPrototy = key => key != 'children' && !isEvent(key);
const isNew = (prev, next) => key => {
  return prev[key] != next[key]
};
const isGone = (prev, next) => key => !(key in next);

// 更新dom
function updateDom(dom, prevProps, nextProps) {
  // 删除失去的事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      key => !(key in nextProps) || isNew(prevProps, nextProps)(key)
    )
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    })

  // 删除失去的属性  
  Object.keys(prevProps)
    .filter(isPrototy)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      dom[name] = ''
    });

  // 更新属性  
  Object.keys(nextProps)
    .filter(isPrototy)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      dom[name] = nextProps[name];
    });

  // 增加事件处理函数
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    })
}


// 根组件提交更新
function commitRoot() {
  // 删除上一次被标记为删除的组件
  deletions.forEach(commitWork);
  // 提交更新
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }

  // 获取到第一个具有dom的父级fiber
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent
  }
  const domParent = domParentFiber.dom;

  // 插入dom
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    // 删除dom
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    // 更新dom
    updateDom(
      fiber.dom,
      fiber.alternate.props,
      fiber.props,
    )
  }

  // 提交第一个child的更新
  commitWork(fiber.child);
  // 提交兄弟组件的更新
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    // 如果有dom属性 删除掉dom
    domParent.removeChild(fiber.dom);
  } else {
    // 如果没有dom属性 找子级删除
    commitDeletion(fiber.child, domParent)
  }
}

// 工作循环 运行当前的工作单元 直至工作单元完全运行完毕
function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitofWork(
      nextUnitOfWork
    );
    shouldYield = deadline.timeRemaining() < 1;
  }

  // 如果没有可协调的工作单元 就执行commit
  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

// 执行当前的工作单元
function performUnitofWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;

  if (isFunctionComponent) {
    // 更新函数组件
    updateFunctionComponent(fiber);
  } else {
    // 更新普通组件
    updateHostComponent(fiber);
  }

  // 如果有child 返回child以供运行
  if (fiber.child) {
    return fiber.child;
  }

  // 返回当前节点的兄弟节点供运行
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent
  }
}

// 更新函数组件节点
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = []

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

// 更新普通节点
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  reconcileChildren(fiber, fiber.props.children)
}


function reconcileChildren(wipFiber, elements) {
  let index = 0;
  // 获取老的fiber结构(替身)
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;

  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;

    // 校验是否是同一类型的节点
    const sameType = oldFiber && element && element.type === oldFiber.type;

    // 如果是同一节点 更新节点dom使用原始dom
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }

    // 如果有element 但是不是同一类型的 做插入处理
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      }
    }

    // 删除处理
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    // 获取兄弟组件
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

