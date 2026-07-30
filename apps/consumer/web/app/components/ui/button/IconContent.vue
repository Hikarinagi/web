<script lang="ts">
  import { cloneVNode, defineComponent, Fragment, h, isVNode } from 'vue'
  import type { VNode, VNodeChild } from 'vue'

  const defaultIconSizeClass = 'size-[1em]'
  const iconSizeClassPattern = /(?:^|\s)!?(?:size|w|h)-/

  function classHasSize(value: unknown): boolean {
    if (!value) return false
    if (typeof value === 'string') return iconSizeClassPattern.test(value)
    if (Array.isArray(value)) return value.some(classHasSize)

    if (typeof value === 'object') {
      return Object.entries(value).some(
        ([className, enabled]) => Boolean(enabled) && classHasSize(className),
      )
    }

    return false
  }

  function styleHasSize(value: unknown): boolean {
    if (!value) return false

    if (typeof value === 'string') {
      return /(?:^|;)\s*(?:width|height|inline-size|block-size)\s*:/.test(value)
    }

    if (Array.isArray(value)) return value.some(styleHasSize)

    if (typeof value === 'object') {
      return ['width', 'height', 'inlineSize', 'blockSize'].some(key => key in value)
    }

    return false
  }

  function hasCustomSize(vnode: VNode): boolean {
    const props = vnode.props

    return Boolean(
      props &&
      (classHasSize(props.class) ||
        styleHasSize(props.style) ||
        props.size ||
        props.width ||
        props.height),
    )
  }

  export default defineComponent({
    name: 'HikariButtonIconContent',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      function withIconDefaults(node: VNodeChild): VNodeChild[] {
        if (!isVNode(node)) return [node]

        if (node.type === Fragment && Array.isArray(node.children)) {
          return node.children.flatMap(withIconDefaults)
        }

        return [
          cloneVNode(
            node,
            {
              class: [attrs.class, hasCustomSize(node) ? undefined : defaultIconSizeClass],
            },
            true,
          ),
        ]
      }

      return () =>
        h(
          'span',
          {
            class: 'inline-flex size-full shrink-0 items-center justify-center overflow-visible',
          },
          slots.default?.().flatMap(withIconDefaults),
        )
    },
  })
</script>
