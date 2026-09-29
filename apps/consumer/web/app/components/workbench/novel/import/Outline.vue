<script setup lang="ts">
  import { Checkbox, Inline, NavLink, Stack, Text, VirtualList } from '@hina-ui/vue'
  import type { BackendNovelImportPreview } from '~/features/workbench/workbench'

  type Chapter = BackendNovelImportPreview['chapters'][number]

  const props = defineProps<{
    chapters: Chapter[]
    stats: { texts: number; images: number }[]
    current: number
  }>()
  const emit = defineEmits<{
    select: [index: number]
    toggle: [index: number | null, value: boolean]
  }>()

  const all = computed(() =>
    props.chapters.every(chapter => chapter.included)
      ? true
      : props.chapters.some(chapter => chapter.included)
        ? 'indeterminate'
        : false,
  )
  const count = (index: number) => {
    const stat = props.stats[index]
    if (stat?.texts) return `${stat.texts} 段`
    return stat?.images ? `${stat.images} 幅插图` : ''
  }
</script>

<template>
  <Stack as="nav" gap="none" aria-label="要导入的章节" class="h-full bg-surface">
    <Inline align="center" gap="sm" :wrap="false" class="h-11 shrink-0 border-b border-line px-4">
      <Checkbox
        :model-value="all"
        size="sm"
        aria-label="全部导入"
        @update:model-value="value => emit('toggle', null, value === true)"
      />
      <Text size="sm" weight="semibold">章节 · {{ chapters.length }}</Text>
    </Inline>
    <VirtualList
      :items="chapters"
      :get-key="chapter => `${chapter.from}:${chapter.to}`"
      :estimate-size="40"
      :dynamic="false"
      height="100%"
      label="章节"
      class="min-h-0 flex-1"
    >
      <template #default="{ item, index }">
        <Inline gap="xs" align="center" :wrap="false" class="h-10 pr-2 pl-4">
          <Checkbox
            :model-value="item.included"
            size="sm"
            :aria-label="`导入“${item.title}”`"
            @update:model-value="value => emit('toggle', index, value === true)"
          />
          <NavLink
            as="button"
            type="button"
            :active="index === current"
            class="min-w-0 flex-1"
            @click="emit('select', index)"
          >
            <Inline gap="sm" align="center" justify="between" :wrap="false" class="w-full">
              <Text
                as="span"
                size="sm"
                :tone="item.included ? undefined : 'faint'"
                truncate
                class="min-w-0"
              >
                {{ item.title }}
              </Text>
              <Text as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
                {{ count(index) }}
              </Text>
            </Inline>
          </NavLink>
        </Inline>
      </template>
    </VirtualList>
  </Stack>
</template>
