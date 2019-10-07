import diffProps from './diffProps.js'

test('add prop', () => {
  const diff = diffProps({}, { class: 'foo' })

  expect(diff).toEqual([{ type: 'add prop', key: 'class', value: 'foo' }])
})

test('remove prop', () => {
  const diff = diffProps({ class: 'foo' }, {})

  expect(diff).toEqual([{ type: 'remove prop', key: 'class' }])
})

test('update prop', () => {
  const diff = diffProps({ class: 'foo' }, { class: 'bar' })

  expect(diff).toEqual([{ type: 'update prop', key: 'class', value: 'bar' }])
})

test('retain prop', () => {
  const diff = diffProps({ class: 'foo' }, { class: 'foo' })

  expect(diff).toEqual([])
})
