import diffNodes from './diffNodes.js'
import diffProps from './diffProps.js'

export default function diff(prev, curr) {
  const diff = []

  diff.push(...diffNodes(prev, curr, [0]))

  return diff
}
