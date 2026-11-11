<script setup lang="ts">
  import { Chip, Heading, Inline, Stack } from '@hina-ui/vue'
  import type { WorkTagsControl } from '~/features/entry/useWorkTags'

  defineOptions({ name: 'EntryTagsSimilar' })
  defineProps<{
    control: WorkTagsControl
    items: { id: number; name: string; works: number }[]
  }>()
</script>

<template>
  <Stack gap="sm">
    <Heading :level="3" size="sm">同类作品常用</Heading>
    <Inline gap="xs">
      <Chip
        v-for="item in items"
        :key="item.id"
        selectable
        :selected="control.all.value.find(tag => !tag.proposed && tag.id === item.id)?.mine === 1"
        size="sm"
        @update:selected="control.voteOn(item)"
      >
        {{ item.name }}
      </Chip>
    </Inline>
  </Stack>
</template>
