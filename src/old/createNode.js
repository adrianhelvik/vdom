import nodeTransformer from './nodeTransformer.js'
import createElement from './createElement.js'
import document from '@adrianhelvik/fragdom'

export default function createNode(virtualNode, pending) {
  virtualNode = nodeTransformer(virtualNode)

  if (typeof virtualNode === 'number') {
    return document.createTextNode(String(virtualNode))
  }

  if (typeof virtualNode === 'string') {
    return document.createTextNode(virtualNode)
  }

  if (virtualNode === null) {
    return document.createFragment()
  }

  if (virtualNode === undefined) {
    throw Error('Pass null, and not undefined to create empty nodes')
  }

  const node =
    typeof virtualNode.type === 'function'
      ? document.createTextNode('')
      : virtualNode.type === createElement.Fragment
      ? document.createFragment()
      : document.createElement(virtualNode.type)

  if (typeof virtualNode.type === 'function') {
    pending.push({
      target: node,
      virtualNode,
    })

    return node
  }

  for (const key of Object.keys(virtualNode.props || {})) {
    if (key !== 'children') {
      node.setAttribute(key, props[key])
    }
  }

  for (const child of virtualNode.props.children) {
    node.appendChild(createNode(child, pending))
  }

  return node
}
