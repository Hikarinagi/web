<script setup lang="ts">
  import { Popover, Sheet } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderHighlightInspector' })

  const { highlights, shell } = useReader()
  const { inspector } = highlights
  const { phone } = shell
</script>

<template>
  <Sheet v-if="phone" v-model:open="inspector.open" title="笔记详情">
    <template #content><LightNovelReaderHighlightDetail quoted /></template>
  </Sheet>
  <Popover
    v-else
    v-model:open="inspector.open"
    :anchor="inspector.anchor"
    :modal="false"
    side="top"
    aria-label="笔记详情"
    class="w-80"
    @open-auto-focus.prevent
    @close-auto-focus.prevent
  >
    <template #content><LightNovelReaderHighlightDetail /></template>
  </Popover>
</template>
