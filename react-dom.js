const ReactDom = {
  render
}


// 创建dom节点
function  createDom(fiber) {
  const dom =
  fiber.type == "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type)

  // 更新/删除dom节点/属性
  updateDom(dom, {}, fiber.props)

  return dom
}

// 渲染视图
function render(element, container) {
  // 构造出root的fiber结构
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  // 待删除的数组
  deletions = [];
  // 下一个工作单元
  nextUnitOfWork = wipRoot;
}