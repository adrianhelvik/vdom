import {
  registerNodeTransformer,
  clearNodeTransformers,
  createElement,
  mount,
} from '.'

beforeEach(() => {
  document.body.innerHTML = ''
  const root = document.createElement('div')
  root.setAttribute('id', 'root')
  document.body.appendChild(root)
})

afterEach(() => {
  clearNodeTransformers()
})

it('allows you to inject node transformers', () => {
  registerNodeTransformer(node => {
    if (!node) {
      return node
    }
    if (typeof node.type === 'function') {
      return node.type()
    }
    return node
  })

  const HelloWorld = () => 'Hello world'
  mount(<HelloWorld />, document.querySelector('#root'))

  expect(document.querySelector('#root').innerHTML).toBe('Hello world')
})
