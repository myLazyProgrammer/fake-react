function App() {
  const [count, setState] = React.useState(1);

  return React.createElement(
    'h1',
    {style: 'background: green', onClick: () => setState(c => c+1)},
    `h1文字${count}`,
    React.createElement('div', null, '我是div的文字', '我是div的文字1')
  )
}

const element = React.createElement(App);
const container = document.getElementById('root');
ReactDom.render(element, container);