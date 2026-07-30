<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { headingSlug, nodeText } from '~/utils/heading'

  defineOptions({ name: 'HikariContentNodesHeading' })

  const props = defineProps<{ node: EditorNode }>()
  const headingId = computed(() => headingSlug(nodeText(props.node)) || undefined)

  // article/post preset 只允许 h2/h3/h4;非法 level fallback 到 h2 (不直接生成 h1,
  // h1 由页面 layout/topbar 控制)
  const tag = computed(() => {
    const lvl = props.node.attrs?.level
    return lvl === 3 || lvl === 4 ? `h${lvl}` : 'h2'
  })

  const textAlign = computed<'center' | 'right' | 'justify' | undefined>(() => {
    const a = props.node.attrs?.text_align
    return a === 'center' || a === 'right' || a === 'justify' ? a : undefined
  })
</script>

<template>
  <component :is="tag" :id="headingId" :style="textAlign ? { textAlign } : undefined">
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </component>
</template>
