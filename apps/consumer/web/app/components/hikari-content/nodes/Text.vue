<script lang="ts">
  import {
    MARK_RENDER_SPECS,
    sanitizeCssColor,
    type EditorMark,
    type EditorNode,
  } from '@hikarinagi/editor-schema'
  import {
    defineComponent,
    h,
    resolveComponent,
    type Component,
    type PropType,
    type VNodeChild,
  } from 'vue'

  const LINK_SPEC = MARK_RENDER_SPECS.link

  function renderWithMarks(text: string, marks: readonly EditorMark[]): VNodeChild {
    let result: VNodeChild = text
    for (let i = marks.length - 1; i >= 0; i--) {
      const mark = marks[i]!
      // Capture current value before reassignment to avoid closure-over-mutated-variable
      // (slot 函数惰性求值时会读到自指 VNode,导致 stack overflow)
      const child: VNodeChild = result
      if (mark.type === 'link') {
        const href = (mark.attrs?.href as string | undefined) ?? '#'
        const isInternal = href.startsWith('/')
        if (isInternal) {
          const NuxtLink = resolveComponent('NuxtLink') as Component
          result = h(
            NuxtLink,
            { to: href, class: LINK_SPEC.class, rel: LINK_SPEC.attrs.rel },
            { default: () => [child] },
          )
        } else {
          result = h(
            'a',
            {
              href,
              class: LINK_SPEC.class,
              rel: LINK_SPEC.attrs.rel,
              target: '_blank',
            },
            [child],
          )
        }
        continue
      }
      if (mark.type === 'text_style') {
        const color = sanitizeCssColor(mark.attrs?.color)
        result = color ? h('span', { style: { color } }, [child]) : child
        continue
      }
      if (mark.type === 'spoiler') {
        const Spoiler = resolveComponent('HikariContentNodesSpoiler') as Component
        result = h(Spoiler, null, { default: () => [child] })
        continue
      }
      const spec = MARK_RENDER_SPECS[mark.type as keyof typeof MARK_RENDER_SPECS]
      if (!spec) continue
      const attrs: Record<string, unknown> = { ...spec.attrs }
      if (spec.class) attrs.class = spec.class
      result = h(spec.tag, attrs, [child])
    }
    return result
  }

  export default defineComponent({
    name: 'HikariContentNodesText',
    props: {
      node: { type: Object as PropType<EditorNode>, required: true },
    },
    setup(props): () => VNodeChild {
      return () => renderWithMarks(props.node.text ?? '', props.node.marks ?? [])
    },
  })
</script>
