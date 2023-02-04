const ReactDom = {
  render
}


function  createDom(fiber) {
  const dom =
  fiber.type == "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(fiber.type)

  updateDom(dom, {}, fiber.props)

  return dom
}


function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}