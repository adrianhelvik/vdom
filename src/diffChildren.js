import diffNodes from './diffNodes.js'

export default function diffChildren(prev, curr, path) {
  const maxLength = Math.max(curr.length, prev.length)
  const diff = []

  for (let i = maxLength - 1; i >= 0; i--) {
    diff.push(...diffNodes(prev[i], curr[i], path.concat(i)))
  }

  return diff
}
