const map = new WeakMap()

export function wrap(node) {
  if (node instanceof Node) {
    return node
  }
  if (!map.has(node)) {
    map.set(node, create(node))
  }
  return map.get(node)
}

export function unwrap(node) {
  if (node instanceof Node) {
    return node.wrappedNode
  } else {
    return node
  }
}

function create(node) {
  switch (node.nodeType) {
    case window.Node.ELEMENT_NODE:
      return new Element(node)
    case window.Node.TEXT_NODE:
      return new Text(node)
    default:
      throw Error(`Unknown node type: ${node.nodeType}`)
  }
}

export default class Node {
  constructor(wrappedNode) {
    if (map.has(wrappedNode)) {
      return map.get(wrappedNode)
    } else {
      this.wrappedNode = wrappedNode
      this.parentNode = null
      if (wrappedNode.nodeType === window.Node.ELEMENT_NODE) {
        this.childNodes = Array.from(wrappedNode.childNodes).map(node =>
          wrap(node),
        )
      }
      map.set(wrappedNode, this)
    }
  }

  static createText(text) {
    return new Text(document.createTextNode(text))
  }

  static createElement(type) {
    return new Element(document.createElement(type))
  }

  static createFragment() {
    return new Fragment()
  }

  get innerHTML() {
    return this.wrappedNode.innerHTML
  }

  set innerHTML(value) {
    throw Error('innerHTML is read only for MixedDOM Nodes')
  }

  get outerHTML() {
    return this.wrappedNode.outerHTML
  }

  appendChild(node) {
    if (node === this) {
      throw Error('Can not append node to self')
    }
    node.parentNode = this
    if (node instanceof Fragment) {
      for (const node of node.flattenNodes()) {
        this.wrappedNode.appendChild(unwrap(node))
      }
    } else {
      this.wrappedNode.appendChild(unwrap(node))
    }
    this.childNodes.push(node)
  }

  remove() {
    this.parentNode.removeChild(this)
  }

  removeChild(child) {
    const index = this.childNodes.indexOf(child)

    if (index === -1) {
      throw Error('Can not remove non child node')
    }

    if (this.childNodes[index] instanceof Fragment) {
      for (const node of this.childNodes[index].flattenNodes()) {
        node.wrappedNode.remove()
      }
    } else {
      this.childNodes[index].wrappedNode.remove()
    }
    this.childNodes.splice(index, 1)
  }
}

export class Fragment extends Node {
  constructor() {
    super([])
    this.parentNode = null
  }

  lastDomChild() {
    process.stdout.write('lastDomChild')
    const node = this.wrappedNode[this.wrappedNode.length - 1]
    if (!node) {
      return null
    }
    if (node instanceof Fragment) {
      return node.lastDomChild()
    } else {
      return node.wrappedNode
    }
  }

  appendChild(node) {
    if (node === this) {
      throw Error('Can not append node to self')
    }
    this.wrappedNode.push(node)
    node.parentNode = this
    const container = this.parentElementNode()
    if (container) {
      const domNodes = Array.from(container.wrappedNode.childNodes)
      console.log(tags(domNodes))
      const elementBefore = this.lastDomChild()
      let next

      if (elementBefore) {
        const index = domNodes.indexOf(elementBefore)
        console.log(index, elementBefore.tagName)
        next = domNodes[index + 1]
      }

      if (next) {
        if (node instanceof Fragment) {
          for (const child of node.flattenNodes()) {
            container.wrappedNode.insertBefore(child.wrappedNode, next)
          }
        } else {
          container.wrappedNode.insertBefore(node.wrappedNode, next)
        }
      } else {
        if (node instanceof Fragment) {
          for (const child of node.flattenNodes()) {
            container.wrappedNode.appendChild(child.wrappedNode)
          }
        } else {
          container.wrappedNode.appendChild(node.wrappedNode)
        }
      }
    }
  }

  parentElementNode() {
    let node = this.parentNode

    while (node instanceof Fragment && node != null) {
      node = node.parentNode
    }

    return node
  }

  get childNodes() {
    return this.wrappedNode
  }

  get innerHTML() {
    return this.wrappedNode
      .map(node => {
        if (node instanceof Text) {
          return node.textContent
        } else {
          return node.outerHTML
        }
      })
      .join('')
  }

  flattenNodes() {
    const result = []
    for (const node of this.childNodes) {
      if (node === this) {
        throw Error('Can not flatten cyclic nodes')
      }
      if (node instanceof Fragment) {
        result.push(...node.flattenNodes())
      } else {
        result.push(node)
      }
    }
    return result
  }

  get outerHTML() {
    return this.innerHTML
  }
}

export class Element extends Node {
  get tagName() {
    return this.wrappedNode.tagName
  }
}

export class Text extends Node {
  get textContent() {
    return this.wrappedNode.textContent
  }
}

const tags = childNodes =>
  Array.from(childNodes).map(node => node.tagName.toLowerCase())
