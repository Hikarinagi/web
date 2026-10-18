<script setup lang="ts">
  import { Empty, NavLink, Stack, Text } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import type { TocRow } from '~/features/light-novel-reader/toc'

  defineOptions({ name: 'LightNovelReaderTocPanel' })

  const { engine, location, goTo } = useReader()
  const { rows, current, chapter } = location
  const { phase } = engine
  const nav = useTemplateRef<ComponentPublicInstance>('nav')

  function pagesOf(row: TocRow) {
    if (row === current.value && chapter.value)
      return `${chapter.value.to} / ${chapter.value.total}`
    return row.pages == null ? '' : String(row.pages)
  }

  watch(
    current,
    () =>
      void nextTick(() => {
        const root: unknown = nav.value?.$el
        if (!(root instanceof Element)) return
        root.querySelector('[aria-current="page"]')?.scrollIntoView({ block: 'nearest' })
      }),
    { immediate: true, flush: 'post' },
  )
</script>

<template>
  <Stack v-if="rows.length" ref="nav" as="nav" aria-label="目录" gap="none" class="p-2">
    <NavLink
      v-for="row in rows"
      :key="row.key"
      as="button"
      type="button"
      :active="row === current"
      :class="row.depth ? 'ps-7' : undefined"
      @click="goTo(row)"
    >
      {{ row.label }}
      <template #trailing>
        <Text as="span" size="sm" tone="faint" class="tabular-nums">{{ pagesOf(row) }}</Text>
      </template>
    </NavLink>
  </Stack>
  <Empty v-else-if="phase === 'ready'" size="sm" title="本书没有目录" class="py-10" />
</template>
