import createElement from './createElement.js'
import document from '@adrianhelvik/fragdom'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'
import mock from '@adrianhelvik/mock'

let container
let renderer

class MockRenderer {
  createTextNode = mock()
  createVoidNode = mock()
  createFragmentNode = mock()
  createElementNode = mock()
  createComponentNode = mock()
  mountComponentNode = mock()
  appendNode = mock()
  lookupNode = mock()
}

const check = template => {
  const diff = createDiff(container, template)
  applyDiff(container, diff, renderer)
}

beforeEach(() => {
  container = window.document.createElement('div')
  renderer = new MockRenderer()
})

describe('directly', () => {
  it('can create an element', () => {
    let path

    check(<div />)
    renderer.lookupNode = (parent, _path) => {
      console.log('lookupNode', parent, _path)
      path = _path
    }

    expect(renderer.createElementNode.$args[0][0]).toEqual(<div />)
    expect(path).toEqual([0])
  })

  xit('can replace an element', () => {
    applyDiff(container, createDiff(container, <div />))
    applyDiff(container, createDiff(container, <span />))

    expect(container.innerHTML).toBe('<span></span>')
  })

  xit('can remove an element', () => {
    applyDiff(container, createDiff(container, <div />))
    applyDiff(container, createDiff(container, null))

    expect(container.innerHTML).toBe('')
  })
})

describe('on child elements', () => {
  xit('can create an element', () => {
    applyDiff(container, createDiff(container, <a />))
    applyDiff(
      container,
      createDiff(
        container,
        <a>
          <b />
        </a>,
      ),
    )

    expect(container.innerHTML).toBe('<a><b></b></a>')
  })

  xit('can replace an element', () => {
    applyDiff(container, createDiff(container, <a />))
    applyDiff(
      container,
      createDiff(
        container,
        <a>
          <b />
        </a>,
      ),
    )
    applyDiff(
      container,
      createDiff(
        container,
        <a>
          <c />
        </a>,
      ),
    )

    expect(container.innerHTML).toBe('<a><c></c></a>')
  })

  xit('can remove an element', () => {
    applyDiff(container, createDiff(container, <a />))
    applyDiff(
      container,
      createDiff(
        container,
        <a>
          <b />
        </a>,
      ),
    )
    applyDiff(container, createDiff(container, <a />))

    expect(container.innerHTML).toBe('<a></a>')
  })

  xit('can add multiple elements', () => {
    applyDiff(
      container,
      createDiff(
        container,
        <div>
          <h1>Hello world</h1>
          <main>
            <p>Foo bar</p>
          </main>
        </div>,
      ),
    )

    expect(container.innerHTML).toBe(
      [
        '<div>',
        /**/ '<h1>Hello world</h1>',
        /**/ '<main>',
        /**/ /**/ '<p>Foo bar</p>',
        /**/ '</main>',
        '</div>',
      ].join(''),
    )
  })

  xit('can remove multiple elements', () => {
    applyDiff(
      container,
      createDiff(
        container,
        <div>
          <h1>Hello world</h1>
          <main>
            <p>Foo bar</p>
          </main>
        </div>,
      ),
    )
    const diff = createDiff(container, <div />)
    applyDiff(container, diff)
    expect(container.innerHTML).toBe('<div></div>')
  })

  xit('can track nodes that should be updated after the initial mount', () => {
    const App = () => {}

    const pending = applyDiff(
      container,
      createDiff(null, <App hello="world" />),
    )

    expect(pending).toEqual([
      {
        target: document.wrap(container).childNodes[0],
        virtualNode: {
          type: App,
          key: undefined,
          props: {
            children: [],
            hello: 'world',
          },
        },
      },
    ])

    expect(pending[0].target.textContent).toBe('')
    expect(pending[0].target.parentNode.tagName).toBe('DIV')
  })
})
