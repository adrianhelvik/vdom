import createElement from './createElement.js'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

let container

beforeEach(() => {
  container = document.createElement('div')
})

it('can create an element', () => {
  const diff = createDiff(null, <div />)
  applyDiff(container, diff)

  expect(container.innerHTML).toBe('<div></div>')
})

it('can replace an element', () => {
  const diff = []

  diff.push(...createDiff(null, <div />))
  diff.push(...createDiff(<div />, <span />))

  applyDiff(container, diff)

  expect(container.innerHTML).toBe('<span></span>')
})
