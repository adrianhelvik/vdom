import createDiff from './createDiff.js'
import applyDiff from './applyDiff.js'

const mounted = new Map()

export default function mount(template, element) {
  const diff = createDiff(mounted.get(element), template)
  applyDiff(element, diff)
  mounted.set(element, template)
}
