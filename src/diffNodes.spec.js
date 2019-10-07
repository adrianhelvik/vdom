import diffNodes from './diffNodes.js'

describe('element nodes', () => {
  test('insert node', () => {
    const diff = diffNodes(null, { type: 'div' })

    expect(diff).toEqual([
      {
        type: 'insert node',
        node: { type: 'div' },
        path: [],
      },
    ])
  })

  test('replace node', () => {
    const diff = diffNodes({ type: 'span' }, { type: 'div' })

    expect(diff).toEqual([
      {
        type: 'replace node',
        node: { type: 'div' },
        path: [],
      },
    ])
  })

  test('remove node', () => {
    const diff = diffNodes({ type: 'span' }, null)

    expect(diff).toEqual([{ type: 'remove node', path: [] }])
  })

  test('keep empty node', () => {
    const diff = diffNodes(null, null)

    expect(diff).toEqual([])
  })

  test('keep node', () => {
    const diff = diffNodes({ type: 'div' }, { type: 'div' })

    expect(diff).toEqual([])
  })
})

describe('text nodes', () => {
  test('insert node', () => {
    const diff = diffNodes(null, 'Hello world')

    expect(diff).toEqual([
      { type: 'insert node', node: 'Hello world', path: [] },
    ])
  })

  test('insert empty text node', () => {
    const diff = diffNodes(null, '')

    expect(diff).toEqual([{ type: 'insert node', node: '', path: [] }])
  })
})
