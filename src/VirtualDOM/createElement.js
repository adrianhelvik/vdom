export default function createElement(type, props, ...children) {
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
