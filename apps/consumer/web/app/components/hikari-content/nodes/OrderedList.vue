<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesOrderedList' })

  const props = defineProps<{ node: EditorNode }>()

  const start = computed(() => {
    const s = props.node.attrs?.start
    return typeof s === 'number' && s > 0 ? s : undefined
  })
</script>

<template>
  <ol :start="start">
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </ol>
</template>
