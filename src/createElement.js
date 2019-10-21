export default function createElement(type, props, ...children) {
  if (type === undefined) {
    throw Error('createElement expected the node type not to be undefined')
  }

  if (props == null) {
    props = {}
  }

  return {
    type,
    key: props.key,
    props: {
      children,
      ...props,
    },
  }
}

createElement.Fragment = Symbol.for('fragment')
