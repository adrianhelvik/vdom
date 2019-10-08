let isDebugging = false

const map = new WeakMap()

export function debug(fn) {
  isDebugging = true
  try {
    fn()
  } finally {
    isDebugging = false
  }
}

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

  toJSX() {
    if (this instanceof Text) {
      return `${this.textContent}`
    }
    if (this instanceof Fragment) {
      return [
        '<>',
        indent(this.wrappedNode.map(n => n.toJSX()).join('\n')),
        '</>',
      ]
        .filter(x => x.trim())
        .join('\n')
    }

    if (this instanceof Element) {
      return (
        [
          `<${this.tagName.toLowerCase()}>`,
          indent(this.childNodes.map(n => n.toJSX()).join('\n')),
          `</${this.tagName.toLowerCase()}>`,
        ]
          .filter(x => x.trim())
          .join('\n') +
        '\n(' +
        this.outerHTML +
        ')'
      )
    }

    console.error('Could not format node:', this)
    throw Error('Could not format node')
  }

  static createText(text) {
    return new Text(document.createTextNode(text))
  }

  static createElement(type) {
    if (typeof type !== 'string') {
      throw Error('Can not call createElement without a string tag name')
    }
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
    if (isDebugging) {
      var log = `appending:\n${indent(node.toJSX())}\n\nto:\n${indent(
        this.toJSX(),
      )}`
    }

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
    if (isDebugging) {
      console.log(`${log}\n\nresulting in:\n${indent(this.toJSX())}`)
    }
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
  get tagName() {
    return '#fragment'
  }

  constructor() {
    super([])
    this.parentNode = null
  }

  lastDomChild() {
    const child = this._lastDomChild()

    console.log(
      `last DOM child in:\n${this.toJSX()}\nis:\n${
        !child ? child : wrap(child).toJSX()
      }`,
    )

    return child
  }

  _lastDomChild() {
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
    if (isDebugging) {
      var log = `appending:\n${indent(node.toJSX())}\n\nto:\n${indent(
        this.toJSX(),
      )}`
    }

    if (node === this) {
      throw Error('Can not append node to self')
    }
    this.wrappedNode.push(node)
    node.parentNode = this
    const container = this.parentElementNode()
    if (container) {
      const domNodes = Array.from(container.wrappedNode.childNodes).map(wrap)
      const elementBefore = this.lastDomChild()
      let next

      if (elementBefore) {
        const index = domNodes.indexOf(elementBefore)
        next = domNodes[index + 1]
      }

      if (next) {
        if (node instanceof Fragment) {
          for (const child of node.flattenNodes()) {
            console.log(
              '-- inserting --:\n' +
                child.toJSX() +
                '\n\n-- Before --:\n' +
                wrap(next).toJSX(),
            )
            container.wrappedNode.insertBefore(
              child.wrappedNode,
              next.wrappedNode,
            )
          }
        } else {
          container.wrappedNode.insertBefore(node.wrappedNode, next.wrappedNode)
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

    if (isDebugging) {
      console.log(
        `${log}\n\nresulting in:\n${indent(this.toJSX())}\n\nas html: ${
          this.outerHTML
        }`,
      )
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
  get tagName() {
    return '#text'
  }

  get textContent() {
    return this.wrappedNode.textContent
  }
}

const tags = childNodes =>
  Array.from(childNodes).map(node => node.tagName.toLowerCase())

const indent = s =>
  s
    .split('\n')
    .map(x => '  ' + x)
    .join('\n')
