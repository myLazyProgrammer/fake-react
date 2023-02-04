const element = React.createElement(
  'div',
  { id: 'foo', style: 'background: black; padding: 20px' },
  React.createElement('a', {
    style: "background: white "
  }, 'bar'),
  React.createElement('b')
)

const container = document.getElementById('root');
ReactDom.render(element, container)