import createElement from '../VirtualDOM/createElement.js'
import createDiff from '../VirtualDOM/createDiff.js'
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

xit('can replace an element', () => {
  const diff = []

  diff.push(...createDiff(null, <div />))
  diff.push(...createDiff(<div />, <span />))

  applyDiff(container, diff)

  expect(container.innerHTML).toBe('<span></span>')
})
