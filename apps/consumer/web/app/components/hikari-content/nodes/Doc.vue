<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesDoc' })

  defineProps<{ node: EditorNode }>()
</script>

<template>
  <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
</template>
