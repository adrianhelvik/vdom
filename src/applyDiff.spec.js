import defaultComponentRendrer from './defaultComponentRendrer'
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

it('can change text', () => {
  const diffA = createDiff(null, <div>Hello world</div>)
  const diffB = createDiff(<div>Hello world</div>, <div>Foo bar</div>)

  applyDiff(container, diffA)
  applyDiff(container, diffB)

  expect(container.innerHTML).toBe('<div>Foo bar</div>')
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

  it('can provide a componentRendrer', () => {
    const App = () => <div>Hello world</div>
    const diff = createDiff(null, <App />)
    let ranCustomRendrer = false

    applyDiff(container, diff, {
      componentRendrer(node, vnode, options) {
        ranCustomRendrer = true
        defaultComponentRendrer(node, vnode, options)
      },
    })

    expect(ranCustomRendrer).toBe(true)
  })

  it('can unmount custom components', () => {
    const App = () => <div>Hello world</div>
    let unmounted = false

    {
      const diff = createDiff(null, <App />)

      applyDiff(container, diff, {
        componentRendrer(node, vnode, options) {
          defaultComponentRendrer(node, vnode, options)
          return () => {
            unmounted = true
          }
        },
      })
    }

    expect(unmounted).toBe(false)

    {
      const diff = createDiff(<App />, <div />)
      applyDiff(container, diff, {
        componentRendrer(node, vnode, options) {
          defaultComponentRendrer(node, vnode, options)
          return () => {
            unmounted = true
          }
        },
      })
    }

    expect(unmounted).toBe(true)
  })
})

describe('bugfix', () => {
  test('creates the correct fragdom', () => {
    const diffA = createDiff(
      null,
      <>
        {'1'}
        {''}
        {'2'}
      </>,
    )

    const diffB = createDiff(
      <>
        {'1'}
        {''}
        {'2'}
      </>,
      <>
        {'1'}
        {'Hello'}
        {'2'}
      </>,
    )

    expect(diffB).toEqual([
      {
        type: 'replace node',
        node: 'Hello',
        path: [0, 1],
      },
    ])

    applyDiff(container, diffA)
    applyDiff(container, diffB)

    expect(fragdom.wrap(container).debug()).toBe(
      [
        /************************************/
        '<div>',
        '  <>',
        '    1',
        '    Hello',
        '    2',
        '  </>',
        '</div>',
      ].join('\n'),
    )
  })

  test('creates the correct html', () => {
    const diffA = createDiff(
      null,
      <>
        {'1'}
        {''}
        {'2'}
      </>,
    )

    const diffB = createDiff(
      <>
        {'1'}
        {''}
        {'2'}
      </>,
      <>
        {'1'}
        Hello
        {'2'}
      </>,
    )

    expect(diffB).toEqual([
      {
        type: 'replace node',
        node: 'Hello',
        path: [0, 1],
      },
    ])

    applyDiff(container, diffA)
    applyDiff(container, diffB)

    expect(container.innerHTML).toBe('1Hello2')
  })
})

describe('replace child bugfix', () => {
  test('bugfix', () => {
    const root = document.createElement('div')

    const diffA = createDiff(
      null,
      <>
        <>
          {''}
          {'1'}
          {'2'}
          {'3'}
        </>
      </>,
    )

    const diffB = createDiff(
      <>
        <>
          {''}
          {'1'}
          {'2'}
          {'3'}
        </>
      </>,
      <>
        <>
          {'Hello'}
          {'1'}
          {'2'}
          {'3'}
        </>
      </>,
    )

    applyDiff(root, diffA)
    applyDiff(root, diffB)

    expect(root.innerHTML).toBe('Hello123')
  })

  test('bugfix', () => {
    const root = document.createElement('div')

    const diffA = {
      args: [
        null,
        {
          type: createElement.Fragment,
          props: { children: ['', '1', '2', '3'] },
        },
      ],
      return: [
        {
          type: 'insert node',
          node: {
            type: createElement.Fragment,
            props: { children: ['', '1', '2', '3'] },
          },
          path: [0],
        },
      ],
    }

    const diffB = {
      args: [
        { props: { children: ['', '1', '2', '3'] } },
        { props: { children: ['Hello', '1', '2', '3'] } },
      ],
      return: [{ type: 'replace node', node: 'Hello', path: [0, 0] }],
    }

    applyDiff(root, diffA.return)
    applyDiff(root, diffB.return)

    expect(root.innerHTML).toBe('Hello123')
  })
})
