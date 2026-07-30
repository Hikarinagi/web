<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesBulletList' })

  defineProps<{ node: EditorNode }>()
</script>

<template>
  <ul>
    <HikariContentDispatch v-for="(child, i) in node.content ?? []" :key="i" :node="child" />
  </ul>
</template>
