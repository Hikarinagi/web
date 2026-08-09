<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesTableRow' })

  const props = defineProps<{ node: EditorNode }>()

  const cells = computed(() =>
    (props.node.content ?? []).filter(
      cell => cell.type === 'table_cell' || cell.type === 'table_header',
    ),
  )
</script>

<template>
  <tr>
    <HikariContentNodesTableCell v-for="(cell, i) in cells" :key="i" :node="cell" />
  </tr>
</template>
