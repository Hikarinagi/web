<script setup lang="ts">
  import { DataList, Editable, Empty, IconButton, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import type { BookmarkEntry } from '~/features/light-novel-reader/useReaderBookmarks'

  defineOptions({ name: 'LightNovelReaderBookmarkList' })

  const { bookmarks, engine, jumps, shell } = useReader()
  const sorted = computed(() =>
    [...bookmarks.entries.value].sort((a, b) => a.progress - b.progress),
  )

  function open(entry: BookmarkEntry) {
    const controller = engine.stack.value?.controller
    if (!controller || !entry.locator) return
    jumps.remember()
    void controller.goToPosition({
      sourceLocator: entry.locator,
      projection: { spreadIndex: 0, pageIndex: 0 },
      progress: entry.progress,
      timestamp: Date.now(),
    })
    shell.settle()
  }
</script>

<template>
  <Empty v-if="!sorted.length" size="sm" title="本卷还没有书签" class="py-10" />
  <DataList
    v-else
    :items="sorted"
    item-key="id"
    size="sm"
    label="书签"
    :min-height="0"
    class="px-3 py-1"
  >
    <template #title="{ item }">
      <Link as="button" type="button" tone="neutral" class="text-start" @click="open(item)">
        {{ item.chapter || '未命名章节' }}
      </Link>
    </template>
    <template #description="{ item }">
      <Stack gap="xs">
        <Text v-if="item.text" size="sm" tone="muted" class="line-clamp-2">{{ item.text }}</Text>
        <Editable
          :model-value="item.note"
          :on-save="(value: string) => bookmarks.annotate(item, value.trim())"
          multiline
          size="sm"
          placeholder="添加备注"
        />
      </Stack>
    </template>
    <template #meta="{ item }">
      <Inline justify="between" align="center" :wrap="false" class="w-full">
        <Text size="sm" tone="faint">{{ timeFromNow(item.createdAt) }}</Text>
        <IconButton
          label="删除书签"
          size="sm"
          variant="ghost"
          tone="neutral"
          @click="bookmarks.remove(item)"
        >
          <Trash2 aria-hidden="true" />
        </IconButton>
      </Inline>
    </template>
  </DataList>
</template>
