<script setup lang="ts">
  import { SegmentedControl } from '@hina-ui/vue'

  const kind = defineModel<'novel' | 'manga' | 'epub'>({ required: true })

  const KIND_OPTIONS = [
    { value: 'novel', label: '小说' },
    { value: 'manga', label: '漫画' },
    { value: 'epub', label: '电子书' },
  ]
</script>

<template>
  <SegmentedControl v-model="kind" :options="KIND_OPTIONS" size="sm" aria-label="投稿类型" />
</template>
