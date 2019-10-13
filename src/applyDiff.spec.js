import createElement from './createElement.js'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

let container
let prev = null
let render = template => {
  applyDiff(container, createDiff(prev, template))
  prev = template
}

beforeEach(() => {
  container = document.createElement('div')
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
    const diff = createDiff(
      <div>
        <h1>Hello world</h1>
        <main>
          <p>Foo bar</p>
        </main>
      </div>,
      <div />,
    )
    applyDiff(container, diff)
    expect(container.innerHTML).toBe('<div></div>')
  })
})
