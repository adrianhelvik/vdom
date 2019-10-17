import diffNodes from './diffNodes.js'

const previousDiffs = new WeakMap()

export default function createDiff(id, newTemplate) {
  const oldTemplate = previousDiffs.has(id) ? previousDiffs.get(id) : null

  const diff = []

  diff.push(...diffNodes(oldTemplate, newTemplate, [0]))

  return diff
}
