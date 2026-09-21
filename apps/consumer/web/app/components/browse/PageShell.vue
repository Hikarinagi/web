<script setup lang="ts" generic="T extends { id: number }">
  import { Heading, Stack, Text } from '@hina-ui/vue'
  import type { Component } from 'vue'
  import type { PageMeta } from '@hikarinagi/shared'

  defineOptions({ name: 'BrowsePageShell' })

  const props = defineProps<{
    title: string
    description: string
    listId: string
    items: T[]
    meta: PageMeta
    icon: Component
    emptyTitle: string
    pending?: boolean
  }>()
  defineEmits<{ clear: [] }>()
  defineSlots<{ filters?(): unknown; card(props: { item: T }): unknown }>()

  const scrollTarget = computed(() => `#${props.listId}`)
</script>

<template>
  <Stack gap="lg" class="mx-auto max-w-app px-6 py-10">
    <Stack gap="none" class="gap-1">
      <Heading :level="1" size="2xl">{{ title }}</Heading>
      <Text size="sm" tone="muted">{{ description }}</Text>
    </Stack>

    <slot name="filters" />

    <BrowseChipsBar />

    <Stack :id="listId" gap="lg" data-list-wrapper>
      <BrowseResultGrid
        :items="items"
        :icon="icon"
        :empty-title="emptyTitle"
        :pending="pending"
        @clear="$emit('clear')"
      >
        <template #card="{ item }">
          <slot name="card" :item="item as T" />
        </template>
      </BrowseResultGrid>

      <Paginator
        :meta="meta"
        :loading="pending"
        route="push"
        align="center"
        :scroll-target="scrollTarget"
      />
    </Stack>
  </Stack>
</template>
