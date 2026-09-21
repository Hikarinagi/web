<script setup lang="ts" generic="T extends { id: number }">
  import { Button, Empty, Grid } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'BrowseResultGrid' })

  defineProps<{
    items: T[]
    icon: Component
    emptyTitle: string
    pending?: boolean
  }>()
  const emit = defineEmits<{ clear: [] }>()
  defineSlots<{ card(props: { item: T }): unknown }>()
</script>

<template>
  <Grid
    v-if="items.length"
    :cols="2"
    gap="none"
    class="relative gap-x-5 gap-y-7 sm:grid-cols-3 lg:grid-cols-6"
  >
    <template v-for="item in items" :key="item.id">
      <slot name="card" :item="item" />
    </template>
    <LoadingOverlay :visible="pending" />
  </Grid>
  <Empty v-else :title="emptyTitle" description="换一个关键词，或放宽筛选条件">
    <template #icon><component :is="icon" /></template>
    <template #actions>
      <Button variant="outline" tone="neutral" size="sm" @click="emit('clear')">清除筛选</Button>
    </template>
  </Empty>
</template>
