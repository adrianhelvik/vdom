import createElement from './createElement.js'

test('create regular element', () => {
  const e = createElement('div', { class: 'foo' }, 'Foo', 'bar')

  expect(e).toEqual({
    type: 'div',
    props: { children: ['Foo', 'bar'], class: 'foo' },
  })
})

test('create function element', () => {
  const MyComponent = () => {}
  const e = createElement(MyComponent, {
    children: ['Foo', 'bar'],
    class: 'foo',
  })

  expect(e).toEqual({
    type: MyComponent,
    props: {
      children: ['Foo', 'bar'],
      class: 'foo',
    },
  })
})

test("Fragment is Symbol.for('fragment')", () => {
  expect(createElement.Fragment).toBe(Symbol.for('fragment'))
})

test('create fragment element', () => {
  const Fragment = createElement.Fragment
  const e = createElement(Fragment, { class: 'foo' }, 'Foo', 'bar')

  expect(e).toEqual({
    type: Fragment,
    props: {
      children: ['Foo', 'bar'],
      class: 'foo',
    },
  })
})
