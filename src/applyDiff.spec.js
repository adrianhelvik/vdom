import createElement from './createElement.js'
import fragdom from '@adrianhelvik/fragdom'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

jest.useFakeTimers()

let container
let prev = null
let render = template => {
  applyDiff(container, createDiff(prev, template))
  prev = template
}

beforeEach(() => {
  container = window.document.createElement('div')
})

afterEach(() => {
  jest.runAllTimers()
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
        target: fragdom.wrap(container).childNodes[0],
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

it('can apply a diff asynchronously', done => {
  const diff = createDiff(null, <div />)
  applyDiff(container, diff, { async: true })
  expect(container.innerHTML).toBe('')
  requestAnimationFrame(() => {
    expect(container.innerHTML).toBe('<div></div>')
    done()
  })
})

it('will not apply a diff asynchronously if a prop is changed', () => {
  const diffA = createDiff(null, <div />)
  const diffB = createDiff(<div />, <div class="foo" />)

  applyDiff(container, diffA)
  applyDiff(container, diffB, { async: true })

  expect(container.innerHTML).toBe('<div class="foo"></div>')
})

it('will not apply a diff asynchronously if a prop is removed', () => {
  const diffA = createDiff(null, <div class="foo" />)
  const diffB = createDiff(<div class="foo" />, <div />)

  applyDiff(container, diffA)
  applyDiff(container, diffB, { async: true })

  expect(container.innerHTML).toBe('<div></div>')
})

describe('components', () => {
  it('renders the component function by default', () => {
    const App = () => <div>Hello world</div>
    const diff = createDiff(null, <App />)

    applyDiff(container, diff)

    expect(container.innerHTML).toBe('<div>Hello world</div>')
  })

  xit('can provide a componentRendrer', () => {
    const App = () => <div>Hello world</div>
    const diff = createDiff(null, <App />)
    const updates = applyDiff(container, diff, {
      componentRendrer(node, vnode) {
        node.parentNode
      },
    })
  })
})
