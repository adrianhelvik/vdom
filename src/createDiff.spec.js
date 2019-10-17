import createElement from './createElement.js'
import diffNodes from './diffNodes.js'

it('can add a child', () => {
  const diff = diffNodes(<div />, <div>Hello world</div>, [0])

  expect(diff).toEqual([
    {
      path: [0, 0],
      type: 'insert node',
      node: 'Hello world',
    },
  ])
})

it('can replace a node based on its key', () => {
  const diff = diffNodes(<div key="a" />, <div key="b" />, [0])

  expect(diff).toEqual([
    { type: 'replace node', path: [0], node: <div key="b" /> },
  ])
})

it('removes the latter elements first', () => {
  const diff = diffNodes(
    <div>
      <h1>Hello world</h1>
      <main>
        <p>Foo bar</p>
      </main>
    </div>,
    <div></div>,
    [0],
  )

  expect(diff).toEqual([
    { type: 'remove node', path: [0, 1] },
    { type: 'remove node', path: [0, 0] },
  ])
})
