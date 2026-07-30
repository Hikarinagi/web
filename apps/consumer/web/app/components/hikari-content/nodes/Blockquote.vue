<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesBlockquote' })

  defineProps<{ node: EditorNode }>()
</script>

<template>
  <blockquote>
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </blockquote>
</template>
