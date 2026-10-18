<script setup lang="ts">
  import { Center, Divider, IconButton, Inline, Popover, Stack, Text, toast } from '@hina-ui/vue'
  import { Copy, NotebookPen } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { HIGHLIGHT_COLORS } from '~/features/light-novel-reader/highlights'

  defineOptions({ name: 'LightNovelReaderSelectionToolbar' })

  const { engine, selection, highlights } = useReader()
  const { anchor, text, chapter } = selection
  const lastColor = useLocalStorage<string>(
    'hikari:light-novel-reader:highlight-color',
    HIGHLIGHT_COLORS[0].value,
  )
  const { copy } = useClipboard({ legacy: true })

  const controller = () => engine.stack.value?.controller

  async function highlight(color: string) {
    const current = controller()
    if (!current) return
    lastColor.value = color
    const record = await current.addAnnotation({ kind: 'highlight', color })
    current.clearSelection()
    return record
  }

  async function note() {
    const at = anchor.value
    const record = await highlight(lastColor.value)
    if (record) highlights.inspect(record.id, at, true)
  }

  async function copyText() {
    await copy(text.value)
    toast.success('已复制')
    controller()?.clearSelection()
  }
</script>

<template>
  <Popover
    :open="anchor !== null"
    :anchor="anchor"
    :modal="false"
    side="top"
    :padded="false"
    aria-label="选区操作"
    @open-auto-focus.prevent
    @close-auto-focus.prevent
    @escape-key-down="controller()?.clearSelection()"
  >
    <template #content>
      <Stack gap="none" class="p-1">
        <Inline gap="none" align="center" :wrap="false">
          <IconButton
            v-for="color in HIGHLIGHT_COLORS"
            :key="color.value"
            :label="`${color.label}高亮`"
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="!chapter"
            @click="highlight(color.value)"
          >
            <Center as="span" class="size-4 rounded-full" :style="{ background: color.swatch }" />
          </IconButton>
          <Divider orientation="vertical" class="mx-1 h-5 self-center" />
          <IconButton
            label="写笔记"
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="!chapter"
            @click="note"
          >
            <NotebookPen aria-hidden="true" />
          </IconButton>
          <IconButton label="复制" size="sm" variant="ghost" tone="neutral" @click="copyText">
            <Copy aria-hidden="true" />
          </IconButton>
        </Inline>
        <Text v-if="!chapter" size="xs" tone="muted" class="px-2 pb-1">高亮不能跨章节</Text>
      </Stack>
    </template>
  </Popover>
</template>
