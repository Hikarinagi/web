<script setup lang="ts">
  import {
    Center,
    Checkbox,
    DataList,
    Empty,
    IconButton,
    Inline,
    Link,
    Mark,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { HIGHLIGHT_COLORS, groupByChapter } from '~/features/light-novel-reader/highlights'
  import { spineIndexOf } from '~/features/light-novel-reader/toc'
  import type { HighlightEntry } from '~/features/light-novel-reader/useReaderHighlights'

  defineOptions({ name: 'LightNovelReaderHighlightList' })

  const { highlights, engine, location, jumps, shell } = useReader()
  const { entries } = highlights
  const colors = ref<string[]>([])
  const noted = ref(false)

  const visible = computed(() =>
    entries.value.filter(
      entry =>
        (!colors.value.length || colors.value.includes(entry.color)) &&
        (!noted.value || entry.note),
    ),
  )
  const groups = computed(() => {
    const reader = engine.stack.value?.reader
    if (!reader) return []
    return groupByChapter(
      visible.value,
      href => spineIndexOf(reader, href),
      location.rows.value.map(row => ({ label: row.label, href: row.entry.href })),
    )
  })
  const orphans = computed(() => visible.value.filter(entry => !entry.target))

  function toggle(color: string) {
    colors.value = colors.value.includes(color)
      ? colors.value.filter(item => item !== color)
      : [...colors.value, color]
  }

  function open(entry: HighlightEntry) {
    jumps.remember()
    void highlights.reveal(entry.id)
    shell.settle()
  }
</script>

<template>
  <Empty v-if="!entries.length" size="sm" title="本卷还没有高亮" class="py-10" />
  <Stack v-else gap="sm" class="py-2">
    <Inline gap="xs" align="center" :wrap="false" class="px-3">
      <IconButton
        v-for="color in HIGHLIGHT_COLORS"
        :key="color.value"
        :label="color.label"
        size="sm"
        :variant="colors.includes(color.value) ? 'soft' : 'ghost'"
        tone="neutral"
        :aria-pressed="colors.includes(color.value)"
        @click="toggle(color.value)"
      >
        <Center as="span" class="size-4 rounded-full" :style="{ background: color.swatch }" />
      </IconButton>
      <Checkbox v-model="noted" class="ms-auto">含笔记</Checkbox>
    </Inline>
    <Empty
      v-if="!groups.length && !orphans.length"
      size="sm"
      title="没有符合筛选条件的高亮"
      class="py-6"
    />
    <Stack v-for="chapter in groups" :key="chapter.items[0]!.id" gap="none">
      <Inline justify="between" class="px-3 pt-2">
        <Text size="xs" tone="muted" weight="medium" truncate>
          {{ chapter.label || '未命名章节' }}
        </Text>
        <Text size="xs" tone="faint" class="tabular-nums">{{ chapter.items.length }}</Text>
      </Inline>
      <DataList
        :items="chapter.items"
        item-key="id"
        size="sm"
        :label="chapter.label || '未命名章节'"
        :min-height="0"
        class="px-3"
      >
        <template #title="{ item }">
          <Link
            as="button"
            type="button"
            tone="neutral"
            class="line-clamp-3 text-start"
            @click="open(item)"
          >
            <Mark :style="{ background: item.color }">{{ item.quote }}</Mark>
          </Link>
        </template>
        <template #description="{ item }">
          <Text v-if="item.note" size="sm" tone="muted" class="line-clamp-3">{{ item.note }}</Text>
        </template>
        <template #meta="{ item }">
          <Tag v-if="item.failed" size="sm" tone="warning">未同步</Tag>
        </template>
      </DataList>
    </Stack>
    <Stack v-if="orphans.length" gap="none">
      <Text size="xs" tone="muted" weight="medium" class="px-3 pt-2">原文已变更</Text>
      <DataList
        :items="orphans"
        item-key="id"
        size="sm"
        label="原文已变更"
        :min-height="0"
        class="px-3"
      >
        <template #title="{ item }">{{ item.quote }}</template>
        <template #description="{ item }">
          <Text v-if="item.note" size="sm" tone="muted">{{ item.note }}</Text>
        </template>
        <template #actions="{ item }">
          <IconButton
            label="删除高亮"
            size="sm"
            variant="ghost"
            tone="neutral"
            @click="highlights.remove(item.id)"
          >
            <Trash2 aria-hidden="true" />
          </IconButton>
        </template>
      </DataList>
    </Stack>
  </Stack>
</template>
