// import mountComponent from './mountComponent.js'
import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

const mounted = new Map()

export default function mount(template, element) {
  const diff = createDiff(mounted.get(element), template)
  const pending = applyDiff(element, diff)
  // pending.forEach(x => mountComponent(x))
  mounted.set(element, template)
}
