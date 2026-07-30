<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesListItem' })

  defineProps<{ node: EditorNode }>()
</script>

<template>
  <li>
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </li>
</template>
