import fragdom from '@adrianhelvik/fragdom'
import createElement from './createElement'
import createDiff from './createDiff'
import applyDiff from './applyDiff'

const { Fragment } = createElement

const prevTemplates = new WeakMap()
const mount = (curr, target) => {
  let prev = prevTemplates.get(target)
  if (prev === undefined) {
    prev = null
  }
  const diff = createDiff(prev, curr)
  prevTemplates.set(target, diff)
  applyDiff(target, diff)
}

test('repro 1', () => {
  const root = document.createElement('div')

  mount([<div class="todoName">By "{''}"</div>], root)
  mount([<div class="todoName">By "{'A nice name'}"</div>], root)

  const todoNameNode = root.querySelector('.todoName')
  const wrappedTodoNameNode = fragdom.wrap(todoNameNode)

  expect(wrappedTodoNameNode.debug()).toBe(
    [
      /*****************************/
      '<div class={todoName}>',
      '  By "',
      '  A nice name',
      '  "',
      '</div>',
    ].join('\n'),
  )
  expect(todoNameNode.textContent).toBe('By "A nice name"')
})
