import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

const previousDiffs = new WeakMap()

export default function defaultComponentRendrer(node, vnode, options) {
  const previous = previousDiffs.get(node)
  const current = vnode.type(vnode.props)
  const diff = createDiff(previous, current)
  applyDiff(node, diff, options)
  if (options.async) {
    node.reconcileAsync()
  } else {
    node.reconcile()
  }
}
