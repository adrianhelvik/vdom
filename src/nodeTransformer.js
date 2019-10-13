let nodeTransformers = []
let existing = new Set()

export function registerNodeTransformer(fn) {
  if (!existing.has(fn)) {
    nodeTransformers.push(fn)
    existing.add(fn)
  }
}

export function clearNodeTransformers() {
  nodeTransformers = []
  existing = new Set()
}

export default node => {
  for (const nodeTransformer of nodeTransformers) {
    node = nodeTransformer(node)
  }
  return node
}
