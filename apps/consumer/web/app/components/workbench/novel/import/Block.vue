<script setup lang="ts">
  import { IconButton, Inline, Text } from '@hina-ui/vue'
  import { Heading, Image as ImageIcon, Minus, Scissors } from '@lucide/vue'
  import type { BackendNovelImportPreview } from '~/features/workbench/workbench'

  defineProps<{
    block: BackendNovelImportPreview['blocks'][number]
    number: number
    titleable: boolean
    splittable: boolean
    lang?: string
    tagged?: boolean
  }>()
  const emit = defineEmits<{ split: [asTitle: boolean] }>()
</script>

<template>
  <Inline gap="lg" align="start" :wrap="false" class="group border-b border-line px-5 py-2.5">
    <Text as="span" size="xs" tone="faint" class="h-7 w-8 shrink-0 pt-1.5 text-right tabular-nums">
      {{ number }}
    </Text>
    <WorkbenchMarkupText
      v-if="block.kind === 'TEXT'"
      :text="block.text ?? ''"
      :lang="lang"
      :tagged="tagged"
      class="min-w-0 flex-1"
    />
    <Inline v-else gap="xs" align="center" :wrap="false" class="min-h-7 min-w-0 flex-1 text-muted">
      <ImageIcon v-if="block.kind === 'IMAGE'" class="size-4 shrink-0" aria-hidden="true" />
      <Minus v-else class="size-4 shrink-0" aria-hidden="true" />
      <Text size="sm" tone="muted" truncate>
        {{ block.kind === 'IMAGE' ? `插图${block.caption ? `：${block.caption}` : ''}` : '分隔' }}
      </Text>
    </Inline>
    <Inline
      gap="none"
      :wrap="false"
      class="shrink-0 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 pointer-coarse:opacity-100"
    >
      <IconButton
        v-if="titleable"
        label="设置为章节标题"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="emit('split', true)"
      >
        <Heading />
      </IconButton>
      <IconButton
        v-if="splittable"
        label="在这里拆分章节"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="emit('split', false)"
      >
        <Scissors />
      </IconButton>
    </Inline>
  </Inline>
</template>
