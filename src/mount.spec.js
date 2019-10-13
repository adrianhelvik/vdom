import createElement from './createElement.js'
import mount from './mount.js'

beforeEach(() => {
  document.body.innerHTML = ''
  const root = document.createElement('div')
  root.setAttribute('id', 'root')
  document.body.appendChild(root)
})

it('can mount an element', () => {
  mount(
    <div>
      <h1>
        Hello <strong>world</strong>
      </h1>
      <main>Foo bar</main>
    </div>,
    document.querySelector('#root'),
  )

  expect(document.querySelector('#root').innerHTML).toBe(
    [
      '<div>',
      /**/ '<h1>Hello <strong>world</strong></h1>',
      /**/ '<main>',
      /**/ /**/ 'Foo bar',
      /**/ '</main>',
      '</div>',
    ].join(''),
  )
})
