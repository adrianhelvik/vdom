import createElement from './createElement.js'
import document from '@adrianhelvik/fragdom'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

let container
let prev = null
let render = template => {
  applyDiff(container, createDiff(prev, template))
  prev = template
}

beforeEach(() => {
  container = window.document.createElement('div')
})

describe('directly', () => {
  it('can create an element', () => {
    applyDiff(container, createDiff(null, <div />))

    expect(container.innerHTML).toBe('<div></div>')
  })

  it('can replace an element', () => {
    applyDiff(container, createDiff(null, <div />))
    applyDiff(container, createDiff(<div />, <span />))

    expect(container.innerHTML).toBe('<span></span>')
  })

  it('can remove an element', () => {
    applyDiff(container, createDiff(null, <div />))
    applyDiff(container, createDiff(<div />, null))

    expect(container.innerHTML).toBe('')
  })
})

describe('on child elements', () => {
  it('can create an element', () => {
    applyDiff(container, createDiff(null, <a />))
    applyDiff(
      container,
      createDiff(
        <a />,
        <a>
          <b />
        </a>,
      ),
    )

    expect(container.innerHTML).toBe('<a><b></b></a>')
  })

  it('can replace an element', () => {
    applyDiff(container, createDiff(null, <a />))
    applyDiff(
      container,
      createDiff(
        <a />,
        <a>
          <b />
        </a>,
      ),
    )
    applyDiff(
      container,
      createDiff(
        <a>
          <b />
        </a>,
        <a>
          <c />
        </a>,
      ),
    )

    expect(container.innerHTML).toBe('<a><c></c></a>')
  })

  it('can remove an element', () => {
    applyDiff(container, createDiff(null, <a />))
    applyDiff(
      container,
      createDiff(
        <a />,
        <a>
          <b />
        </a>,
      ),
    )
    applyDiff(
      container,
      createDiff(
        <a>
          <b />
        </a>,
        <a />,
      ),
    )

    expect(container.innerHTML).toBe('<a></a>')
  })

  it('can add multiple elements', () => {
    applyDiff(
      container,
      createDiff(
        null,
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

  it('can remove multiple elements', () => {
    const diffA = createDiff(
      null,
      <container>
        <first-child>Hello world</first-child>
        <second-child>
          <p>Foo bar</p>
        </second-child>
      </container>,
    )

    const diffB = createDiff(
      <container>
        <first-child>Hello world</first-child>
        <second-child>
          <p>Foo bar</p>
        </second-child>
      </container>,
      <container />,
    )

    applyDiff(container, diffA)
    applyDiff(container, diffB)

    expect(container.innerHTML).toBe('<container></container>')
  })

  it('can track nodes that should be updated after the initial mount', () => {
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

it('can set initial props', () => {
  const diff = createDiff(null, <div class="foo" />)
  applyDiff(container, diff)
  expect(container.innerHTML).toBe('<div class="foo"></div>')
})

it('can add props', () => {
  const diffA = createDiff(null, <div />)
  const diffB = createDiff(<div />, <div class="foo" />)

  applyDiff(container, diffA)
  applyDiff(container, diffB)

  expect(container.innerHTML).toBe('<div class="foo"></div>')
})

it('can remove props', () => {
  const diffA = createDiff(null, <div class="foo" />)
  const diffB = createDiff(<div class="foo" />, <div />)

  applyDiff(container, diffA)
  applyDiff(container, diffB)

  expect(container.innerHTML).toBe('<div></div>')
})
