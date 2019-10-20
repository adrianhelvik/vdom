import document from '@adrianhelvik/fragdom'
import createNode from './createNode.js'

it('creates an empty fragment if the value is null', () => {
  expect(createNode(null, [])).toEqual(document.createFragment())
})

it('throws if the value is undefined', () => {
  expect(() => createNode(undefined, [])).toThrow(
    'Pass null, and not undefined to create empty nodes',
  )
})

it('converts numbers to strings', () => {
  expect(createNode(123, [])).toEqual(document.createTextNode('123'))
})

it('converts NaN to an empty string', () => {
  expect(createNode(NaN, [])).toEqual(document.createTextNode(''))
})

it('can create a function node', () => {
  expect(createNode({ type: () => 'Hello world' }, [])).toEqual(
    document.createTextNode('Hello world'),
  )
})
