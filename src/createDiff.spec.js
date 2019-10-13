import createElement from './createElement.js'
import createDiff from './createDiff.js'

it('can add a child', () => {
  const diff = createDiff(<div />, <div>Hello world</div>)

  expect(diff).toEqual([
    {
      path: [0, 0],
      type: 'insert node',
      node: 'Hello world',
    },
  ])
})

it('can replace a node based on its key', () => {
  const diff = createDiff(<div key="a" />, <div key="b" />)

  expect(diff).toEqual([
    { type: 'replace node', path: [0], node: <div key="b" /> },
  ])
})

it('removes the latter elements first', () => {
  const diff = createDiff(
    <div>
      <h1>Hello world</h1>
      <main>
        <p>Foo bar</p>
      </main>
    </div>,
    <div></div>,
  )

  expect(diff).toEqual([
    { type: 'remove node', path: [0, 1] },
    { type: 'remove node', path: [0, 0] },
  ])
})
