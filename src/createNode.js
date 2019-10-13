import nodeTransformer from './nodeTransformer.js'
import createElement from './createElement.js'
import document from '@adrianhelvik/fragdom'

export default function createNode(virtualNode) {
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
    virtualNode.type === createElement.Fragment
      ? document.createFragment()
      : document.createElement(virtualNode.type)

  for (const key of Object.keys(virtualNode.props || {})) {
    if (key !== 'children') {
      node.setAttribute(key, props[key])
    }
  }

  for (const child of virtualNode.props.children) {
    node.appendChild(createNode(child))
  }

  return node
}
