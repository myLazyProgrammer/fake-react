const ReactDom = {
  render
}


function  createDom(element) {
  const dom = element.type == 'TEXT_ELEMENT' ?  document.createTextNode('') : document.createElement(element.type);

  const isPrototype = key => key != 'children';

  Object.keys(element.props)
    .filter(isPrototype)
    .forEach(name => {
      dom[name] = element.props[name]
    })

  element.props.children.forEach(child => render(child, dom))

  return dom;
}


function render(element, container) {
  wipRoot = {
    com: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}