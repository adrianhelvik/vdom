export default function applyDiff(root, diff, renderer) {
  for (const action of diff) {
    switch (action.type) {
      case 'insert node': {
        const target = renderer.lookupNode(root, action.path)
        renderer.appendNode(
          renderer.lookupNode(root, action.path),
          renderer.createElementNode(action.node),
        )
        break
      }
      default:
        throw Error(`Unhandled action type: ${action.type}`)
    }
  }
}
