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

  if (typeof virtualNode === 'boolean') {
    return fragdom.createFragment()
  }

  if (Array.isArray(virtualNode)) {
    const node = fragdom.createFragment()

    for (const child of virtualNode) {
      node.appendChild(createNode(child, pendingComponents))
    }

    return node
  }

  if (typeof virtualNode === 'object' && virtualNode.type === undefined) {
    throw Error(`Invalid virtual node type: ${typeof virtualNode.type}`)
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

  if (virtualNode.props) {
    for (const key of Object.keys(virtualNode.props)) {
      if (key !== 'children') {
        node.setAttribute(key, virtualNode.props[key])
      }
    }

    if (Array.isArray(virtualNode.props.children)) {
      for (const child of virtualNode.props.children) {
        node.appendChild(createNode(child, pendingComponents))
      }
    } else {
      node.appendChild(
        createNode(virtualNode.props.children, pendingComponents),
      )
    }
  }

  return node
}
