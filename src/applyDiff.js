import document from '@adrianhelvik/fragdom'
import createNode from './createNode.js'

export default function applyDiff(container, diff) {
  const pending = []

  if (container instanceof window.Element) {
    container = document.wrap(container)
  }

  for (const action of diff) {
    const path = action.path.slice(0, action.path.length - 1)
    const index = action.path[action.path.length - 1]
    const node = lookup(container, path)

    switch (action.type) {
      case 'replace node': {
        node.childNodes[index].remove()
        node.appendChild(createNode(action.node, pending))
        break
      }
      case 'insert node':
        node.appendChild(createNode(action.node, pending))
        break
      case 'remove node':
        node.childNodes[index].remove()
        node.reconcile() // XXX: Not needed when fragdom issue #1 is resolved
        break
      default:
        throw Error(
          `Unknown diff action type: "${action.type}"\n${JSON.stringify(
            action,
            null,
            2,
          )}`,
        )
    }
  }

  container.reconcile()

  return pending
}

function lookup(node, path) {
  if (!path.length) {
    return node
  }
  return lookup(node.childNodes[path[0]], path.slice(1))
}
