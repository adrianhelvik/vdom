import createElement from './createElement.js'
import fragdom from '@adrianhelvik/fragdom'

export default function createNode(virtualNode, pendingComponents) {
  if (!Array.isArray(pendingComponents)) {
    throw Error('Expected "pendingComponents" to be an array')
  }

  if (typeof virtualNode === 'number') {
    return fragdom.createTextNode(String(virtualNode))
  }

  if (typeof virtualNode === 'string') {
    return fragdom.createTextNode(virtualNode)
  }

  if (virtualNode === null) {
    return fragdom.createFragment()
  }

  if (virtualNode === undefined) {
    throw Error('Pass null, and not undefined to create empty nodes')
  }

  const node =
    typeof virtualNode.type === 'function'
      ? fragdom.createFragment()
      : virtualNode.type === createElement.Fragment
      ? fragdom.createFragment()
      : fragdom.createElement(virtualNode.type)

  if (typeof virtualNode.type === 'function') {
    pendingComponents.push({
      target: node,
      virtualNode,
    })

    return node
  }

  for (const key of Object.keys(virtualNode.props || {})) {
    if (key !== 'children') {
      node.setAttribute(key, virtualNode.props[key])
    }
  }

  for (const child of virtualNode.props.children) {
    node.appendChild(createNode(child, pendingComponents))
  }

  return node
}
