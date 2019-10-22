import fragdom from '@adrianhelvik/fragdom'
import createNode from './createNode.js'

it('creates an empty fragment if the value is null', () => {
  expect(createNode(null, [])).toEqual(fragdom.createFragment())
})

it('throws if the value is undefined', () => {
  expect(() => createNode({ type: undefined }, [])).toThrow(
    'Invalid virtual node type: undefined',
  )
})

it('converts numbers to strings', () => {
  expect(createNode(123, [])).toEqual(fragdom.createTextNode('123'))
})

it('converts NaN to an empty string', () => {
  expect(createNode(NaN, [])).toEqual(fragdom.createTextNode(''))
})

it('can create a function node', () => {
  expect(createNode({ type: () => 'Hello world' }, [])).toEqual(
    fragdom.createTextNode('Hello world'),
  )
})

it('converts arrays to fragments', () => {
  expect(createNode([], [])).toEqual(fragdom.createFragment())
})

it('appends child components to fragment arrays', () => {
  const expected = fragdom.createFragment()
  expected.appendChild(fragdom.createElement('div'))
  expect(createNode([{ type: 'div' }], [])).toEqual(expected)
})

it('can create child nodes from non-array children', () => {
  const actual = createNode(
    {
      type: 'div',
      props: {
        children: {
          type: 'div',
        },
      },
    },
    [],
  )

  const expected = fragdom.createElement('div')
  expected.appendChild(fragdom.createElement('div'))

  expect(actual).toEqual(expected)
})
