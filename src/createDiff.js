import createElement from './createElement.js'
import diffNodes from './diffNodes.js'
import diffProps from './diffProps.js'

export default function diff(prev, curr) {
  const diff = []

  if (Array.isArray(prev)) {
    prev = createElement(createElement.Fragment, {}, ...prev)
  }
  if (Array.isArray(curr)) {
    curr = createElement(createElement.Fragment, {}, ...curr)
  }

  diff.push(...diffNodes(prev, curr, [0]))

  return diff
}
