import createElement from './createElement.js'
import fragdom from '@adrianhelvik/fragdom'
import mount from './mount.js'

const $ = document.querySelector.bind(document)

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
    $('#root'),
  )

  expect($('#root').innerHTML).toBe(
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

it('can mount fragment nodes', () => {
  mount(
    <>
      <h1>Hello world</h1>
      Foo <>bar</>
      <b>Baz</b>
    </>,
    $('#root'),
  )

  expect($('#root').innerHTML).toBe('<h1>Hello world</h1>Foo bar<b>Baz</b>')
})
