import createNode from '../MixedDOM/createNode.js'

export default function applyDiff(container, diff) {
  // console.log(diff)

  for (const action of diff) {
    const index = action.path[action.path.length - 1]

    switch (action.type) {
      case 'replace node':
        container.replaceChild(
          container.childNodes[index],
          createNode(action.node),
        )
        break
      case 'insert node':
        container.appendChild(createNode(action.node))
        break
      default:
        throw Error(
          `Unknown diff action type: "${action.type}"\n${JSON.stringify(
            action,
            null,
            2,
          )}`,
        )
    }
  }
}
