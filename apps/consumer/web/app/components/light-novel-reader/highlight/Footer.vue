<script setup lang="ts">
  import { Button, Inline, toast } from '@hina-ui/vue'
  import { Copy } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { groupByChapter, toMarkdown } from '~/features/light-novel-reader/highlights'
  import { spineIndexOf } from '~/features/light-novel-reader/toc'

  defineOptions({ name: 'LightNovelReaderHighlightFooter' })

  const { title, highlights, engine, location, analytics } = useReader()
  const { copy } = useClipboard({ legacy: true })

  async function exportNotes() {
    const reader = engine.stack.value?.reader
    if (!reader) return
    const groups = groupByChapter(
      highlights.entries.value,
      href => spineIndexOf(reader, href),
      location.rows.value.map(row => ({ label: row.label, href: row.entry.href })),
    )
    await copy(toMarkdown(title.value, groups))
    analytics.track('export', { from: 'highlights' })
    toast.success('已复制为 Markdown')
  }
</script>

<template>
  <Inline justify="end" align="center" :wrap="false" class="w-full">
    <Button variant="ghost" tone="neutral" size="sm" @click="exportNotes">
      <template #icon><Copy aria-hidden="true" /></template>
      复制为 Markdown
    </Button>
  </Inline>
</template>
