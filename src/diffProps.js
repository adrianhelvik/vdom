import diffChildren from './diffChildren.js'

export default function diffProps(prev, curr, path) {
  if (prev == null) prev = {}
  if (curr == null) curr = {}

  const diff = []

  for (const key of Object.keys(prev)) {
    if (!curr.hasOwnProperty(key)) {
      diff.push({
        type: 'remove prop',
        key,
        path,
      })
    }
  }

  for (const key of Object.keys(curr)) {
    if (prev.hasOwnProperty(key)) {
      if (curr[key] !== prev[key]) {
        if (key === 'children') {
          diff.push(...diffChildren(prev[key], curr[key], path))
        } else {
          diff.push({
            type: 'set prop',
            key,
            value: curr[key],
            path,
          })
        }
      }
    } else {
      diff.push({
        type: 'set prop',
        key,
        value: curr[key],
        path,
      })
    }
  }

  return diff
}
