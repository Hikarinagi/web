<script setup lang="ts">
  import {
    Button,
    Card,
    Heading,
    Inline,
    Mark,
    Ripple,
    ScrollArea,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { Copy, Highlighter } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { groupByChapter, toMarkdown } from '~/features/light-novel-reader/highlights'
  import { spineIndexOf } from '~/features/light-novel-reader/toc'
  import type { HighlightEntry } from '~/features/light-novel-reader/useReaderHighlights'

  defineOptions({ name: 'LightNovelReaderEndNotes' })

  const { title, end, highlights, engine, location, jumps, shell } = useReader()
  const { copy } = useClipboard({ legacy: true })

  function chapters(items: readonly HighlightEntry[]) {
    const reader = engine.stack.value?.reader
    if (!reader) return []
    return groupByChapter(
      items,
      href => spineIndexOf(reader, href),
      location.rows.value.map(row => ({ label: row.label, href: row.entry.href })),
    )
  }

  const groups = computed(() => chapters(highlights.entries.value.filter(entry => entry.note)))

  function open(entry: HighlightEntry) {
    end.close()
    jumps.remember()
    void highlights.reveal(entry.id)
  }

  function showAll() {
    shell.tab.value = 'highlights'
    if (!shell.leftDocked.value && shell.drawer.value !== 'left') shell.toggleLeft()
  }

  async function exportNotes() {
    await copy(toMarkdown(title.value, chapters(highlights.entries.value)))
    toast.success('已复制为 Markdown')
  }
</script>

<template>
  <Stack
    v-if="groups.length"
    gap="none"
    class="hidden min-w-0 flex-1 basis-0 border-s border-line bg-subtle @3xl:flex"
  >
    <Heading :level="3" class="px-12 pt-9 pb-2">本卷笔记回顾</Heading>
    <ScrollArea class="min-h-0 flex-1">
      <Stack gap="sm" class="px-12 pb-4">
        <Stack v-for="group in groups" :key="group.items[0]!.id" gap="xs">
          <Text size="xs" tone="faint" class="pt-2">{{ group.label || '未命名章节' }}</Text>
          <Card
            v-for="item in group.items"
            :key="item.id"
            as="button"
            type="button"
            data-density="compact"
            class="hn-state-layer w-full hn-interactive text-start hn-press-lg"
            @click="open(item)"
          >
            <Ripple />
            <Stack gap="xs">
              <Text class="line-clamp-4">
                <Mark :style="{ background: item.color }">{{ item.quote }}</Mark>
              </Text>
              <Text size="sm" tone="muted" class="line-clamp-4">{{ item.note }}</Text>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </ScrollArea>
    <Inline gap="sm" class="px-12 pt-3 pb-6">
      <Button variant="outline" tone="neutral" size="sm" @click="showAll">
        <template #icon><Highlighter aria-hidden="true" /></template>
        查看全部高亮
      </Button>
      <Button variant="outline" tone="neutral" size="sm" @click="exportNotes">
        <template #icon><Copy aria-hidden="true" /></template>
        复制为 Markdown
      </Button>
    </Inline>
  </Stack>
</template>
