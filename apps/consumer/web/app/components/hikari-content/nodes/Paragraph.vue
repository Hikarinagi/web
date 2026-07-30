<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesParagraph' })

  const props = defineProps<{ node: EditorNode }>()

  const textAlign = computed<'center' | 'right' | 'justify' | undefined>(() => {
    const a = props.node.attrs?.text_align
    return a === 'center' || a === 'right' || a === 'justify' ? a : undefined
  })
</script>

<template>
  <p :style="textAlign ? { textAlign } : undefined">
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </p>
</template>
