import diffProps from './diffProps.js'

export default function diffNodes(prev, curr, path = []) {
  if (prev == null && curr == null) {
    return []
  }

  if (prev == null) {
    return [
      {
        type: 'insert node',
        node: curr,
        path,
      },
    ]
  }

  if (curr == null) {
    return [
      {
        type: 'remove node',
        path,
      },
    ]
  }

  if (typeof prev === 'object' && typeof curr === 'object') {
    if (prev.type !== curr.type || prev.key !== curr.key) {
      return [
        {
          type: 'replace node',
          node: curr,
          path,
        },
      ]
    } else {
      return diffProps(prev.props, curr.props, path)
    }
  }

  if (prev !== curr) {
    return [
      {
        type: 'replace node',
        node: curr,
        path,
      },
    ]
  }

  return []
}
