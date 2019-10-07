export default function createNode(virtualNode) {
  if (typeof virtualNode === 'string') {
    return document.createTextNode(virtualNode)
  }

  const node = document.createElement(virtualNode.type)

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
