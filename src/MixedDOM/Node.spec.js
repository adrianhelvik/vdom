import Node, { wrap, unwrap, Element, Fragment, Text, debug } from './Node.js'

describe('constructors', () => {
  it('can create an element node', () => {
    const node = Node.createElement('div')

    expect(node.wrappedNode.tagName).toBe('DIV')
    expect(node instanceof Element).toBe(true)
  })

  it('can create a text node', () => {
    const node = Node.createText('Hello world')

    expect(node.wrappedNode.textContent).toBe('Hello world')
    expect(node instanceof Text).toBe(true)
  })

  it('can create a fragment node', () => {
    const node = Node.createFragment()

    expect(node.wrappedNode).toEqual([])
    expect(node instanceof Fragment).toBe(true)
  })
})

describe('appendChild()', () => {
  it('can append an element node', () => {
    const node = Node.createElement('outer')

    node.appendChild(Node.createElement('inner'))

    expect(node.outerHTML).toBe('<outer><inner></inner></outer>')
  })

  it('can append a fragment', () => {
    const container = Node.createElement('div')
    const fragment = Node.createFragment()

    fragment.appendChild(Node.createElement('first'))
    fragment.appendChild(Node.createElement('second'))
    fragment.appendChild(Node.createElement('third'))

    container.appendChild(fragment)

    expect(container.childNodes.length).toBe(1)
  })

  it('can append a nested fragment', () => {
    const container = Node.createElement('div')
    const outer = Node.createFragment()
    const inner = Node.createFragment()

    const a = Node.createElement('a')
    const b = Node.createElement('b')
    const c = Node.createElement('c')

    outer.appendChild(a)
    outer.appendChild(inner)
    inner.appendChild(b)
    inner.appendChild(c)

    container.appendChild(outer)

    expect(container.innerHTML).toBe('<a></a><b></b><c></c>')
    expect(container.childNodes.length).toBe(1)
    expect(outer.childNodes.length).toBe(2)
    expect(inner.childNodes.length).toBe(2)
  })

  it('can append a text node', () => {
    const fragment = Node.createFragment()

    fragment.appendChild(Node.createText('Hello world'))
  })

  it('can append a nested fragment', () => {
    const container = Node.createElement('div')
    const fragment1 = Node.createFragment()
    const fragment2 = Node.createFragment()
    const text1 = Node.createText('first')
    const text2 = Node.createText('second')
    const text3 = Node.createText('third')

    fragment2.appendChild(text1)
    fragment2.appendChild(text2)
    fragment2.appendChild(text3)
    fragment1.appendChild(fragment2)
    container.appendChild(fragment1)

    expect(container.innerHTML).toBe('firstsecondthird')
    expect(container.wrappedNode.childNodes.length).toBe(3)
  })
})

describe('remove', () => {
  it('can remove an element', () => {
    const container = Node.createElement('div')

    container.appendChild(Node.createElement('div'))
    container.appendChild(Node.createText('Hello world'))
    container.appendChild(Node.createElement('span'))
    container.appendChild(Node.createElement('strong'))

    container.childNodes[2].remove()

    expect(container.childNodes.length).toBe(3)

    expect([
      container.childNodes[0].tagName,
      container.childNodes[1].textContent,
      container.childNodes[2].tagName,
    ]).toEqual(['DIV', 'Hello world', 'STRONG'])
  })

  it('can append a child to an attached fragment', () => {
    const container = Node.createElement('div')
    const fragment = Node.createFragment()
    const textNode = Node.createText('Hello world')

    container.appendChild(fragment)
    fragment.appendChild(textNode)

    expect(container.wrappedNode.childNodes.length).toBe(1)
    expect(container.wrappedNode.childNodes[0]).toBe(textNode.wrappedNode)
  })

  it('can remove a fragment', () => {
    const container = Node.createElement('div')
    const outer = Node.createFragment()
    const inner = Node.createFragment()

    const before = Node.createElement('before')
    const a = Node.createElement('a')
    const b = Node.createElement('b')
    const c = Node.createElement('c')
    const after = Node.createElement('after')

    container.appendChild(before)
    outer.appendChild(a)
    outer.appendChild(inner)
    inner.appendChild(b)
    inner.appendChild(c)
    container.appendChild(outer)
    container.appendChild(after)

    outer.remove()

    expect(container.innerHTML).toBe('<before></before><after></after>')
    expect(outer.innerHTML).toBe('<a></a><b></b><c></c>')
  })
})

describe('removeChild', () => {
  it('can not remove a non-child node', () => {
    const frag1 = Node.createFragment()
    const frag2 = Node.createFragment()

    expect(() => frag1.removeChild(frag2)).toThrow(
      'Can not remove non child node',
    )
  })
})

describe('Fragment#get innerHTML', () => {
  it('works', () => {
    const frag = Node.createFragment()

    frag.appendChild(Node.createElement('first'))
    frag.appendChild(Node.createElement('second'))

    expect(frag.innerHTML).toBe('<first></first><second></second>')
  })
})

describe('Fragment#get outerHTML', () => {
  it('throws', () => {
    const frag = Node.createFragment()

    frag.appendChild(Node.createElement('first'))
    frag.appendChild(Node.createElement('second'))

    expect(frag.outerHTML).toBe('<first></first><second></second>')
  })
})

test('setting innerHTML throws an error', () => {
  expect(() => (Node.createElement('div').innerHTML = '')).toThrow(
    'innerHTML is read only for MixedDOM Nodes',
  )
})

test('it wraps child nodes', () => {
  const element = document.createElement('div')

  element.innerHTML = 'Hello <strong>world</strong>'

  const node = wrap(element)

  expect(node.childNodes[0] instanceof Text).toBe(true)
  expect(node.childNodes[1] instanceof Element).toBe(true)

  expect(node.childNodes[0]).toBe(wrap(node.wrappedNode.childNodes[0]))
  expect(node.childNodes[1]).toBe(wrap(node.wrappedNode.childNodes[1]))
})

it('returns the existing node when attempting to instantiate an already wrapped node', () => {
  const element = document.createElement('div')

  expect(new Element(element)).toBe(new Element(element))
})

it('throws for unknown node types', () => {
  expect(() => wrap({})).toThrow()
})

test('wrap returns the node if it is already wrapped', () => {
  const element = document.createElement('div')
  expect(wrap(wrap(wrap(element)))).toBe(wrap(element))
})

test('unwrap returns the node if it is not wrapped', () => {
  const element = document.createElement('div')

  expect(unwrap(element)).toBe(element)
})

test('it can not append a fragment node to itself', () => {
  const node = wrap(Node.createFragment())
  expect(() => node.appendChild(node)).toThrow('Can not append node to self')
})

test('it can not append an element node to itself', () => {
  const node = wrap(Node.createElement('div'))
  expect(() => node.appendChild(node)).toThrow('Can not append node to self')
})

test('lastDomChild coverage', () => {
  const node = Node.createElement('outer')
  node.appendChild(Node.createFragment())
  node.childNodes[0].appendChild(Node.createFragment())
  node.appendChild(Node.createElement('second'))
  node.childNodes[0].childNodes[0].appendChild(Node.createElement('first'))
  node.appendChild(Node.createElement('third'))

  expect(node.innerHTML).toBe('<first></first><second></second><third></third>')
})

it('can append a fragment', () => {
  const tags = container =>
    Array.from(
      container.wrappedNode ? container.wrappedNode.childNodes : container,
    ).map(node => node.tagName.toLowerCase())

  const container = Node.createElement('div')
  const wrapper = Node.createFragment()
  const inner1 = Node.createFragment()
  const inner2 = Node.createFragment()

  container.appendChild(wrapper)

  inner1.appendChild(Node.createElement('a'))
  inner1.appendChild(Node.createElement('b'))
  wrapper.appendChild(inner1)

  inner2.appendChild(Node.createElement('c'))
  inner2.appendChild(Node.createElement('d'))
  wrapper.appendChild(inner2)

  expect(container.inspect()).toBe(
    [
      '<div>',
      '  <>',
      '    <>',
      '      <a>',
      '      </a>',
      '      (<a></a>)',
      '      <b>',
      '      </b>',
      '      (<b></b>)',
      '    </>',
      '    <>',
      '      <c>',
      '      </c>',
      '      (<c></c>)',
      '      <d>',
      '      </d>',
      '      (<d></d>)',
      '    </>',
      '  </>',
      '</div>',
      '(<div><a></a><b></b><c></c><d></d></div>)',
    ].join('\n'),
  )
})
