function App(props) {
  return React.createElement(
    'h1',
    null,
    'h1',
    props.name
  )
}

const element = React.createElement(App, {name: 'foo'});


const container = document.getElementById('root');
ReactDom.render(element, container);