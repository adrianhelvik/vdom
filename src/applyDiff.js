import defaultComponentRendrer from './defaultComponentRendrer.js'
import document from '@adrianhelvik/fragdom'
import createNode from './createNode.js'

export default function applyDiff(container, diff, options = {}) {
  if (options.async === undefined) options.async = false
  if (options.componentRendrer === undefined)
    options.componentRendrer = defaultComponentRendrer

  const pendingComponents = []
  let async = Boolean(options.async)

  if (container instanceof window.Element) {
    container = document.wrap(container)
  }

  for (const action of diff) {
    const path = action.path.slice(0, action.path.length - 1)
    const index = action.path[action.path.length - 1]
    const node = lookup(container, path)

    switch (action.type) {
      case 'replace node':
        node.childNodes[index].remove()
        node.appendChild(createNode(action.node, pendingComponents))
        break
      case 'insert node':
        node.appendChild(createNode(action.node, pendingComponents))
        break
      case 'remove node':
        node.childNodes[index].remove()
        break
      case 'add prop':
        async = false
        node.childNodes[index].setAttribute(action.key, action.value)
        break
      case 'remove prop':
        async = false
        node.childNodes[index].removeAttribute(action.key)
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

  if (async) {
    container.reconcileAsync()
  } else {
    container.reconcile()
  }

  for (const { target, virtualNode } of pendingComponents) {
    options.componentRendrer(target, virtualNode, options)
  }

  return pendingComponents
}

function lookup(node, path) {
  if (!path.length) {
    return node
  }
  return lookup(node.childNodes[path[0]], path.slice(1))
}
