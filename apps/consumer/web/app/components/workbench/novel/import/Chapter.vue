<script setup lang="ts">
  import { Button, Checkbox, Editable, Inline, Stack, Text, VirtualList } from '@hina-ui/vue'
  import { ArrowUpToLine, Heading, Scissors } from '@lucide/vue'
  import type { BackendNovelImportPreview } from '~/features/workbench/workbench'

  const props = defineProps<{
    blocks: BackendNovelImportPreview['blocks']
    chapter: BackendNovelImportPreview['chapters'][number]
    first: boolean
    stats: { texts: number; images: number }
    canSplit: (block: number, asTitle: boolean) => boolean
    lang?: string
  }>()
  const emit = defineEmits<{
    split: [block: number, asTitle: boolean]
    merge: []
    rename: [title: string]
    toggle: [included: boolean]
  }>()

  const indexes = computed(() =>
    Array.from(
      { length: props.chapter.to - props.chapter.from },
      (_, at) => props.chapter.from + at,
    ),
  )
</script>

<template>
  <Stack gap="none" class="h-full bg-surface">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="min-h-11 shrink-0 border-b border-line py-1.5 pr-3 pl-5"
    >
      <Editable
        :model-value="chapter.title"
        :controls="false"
        :maxlength="200"
        required
        size="sm"
        aria-label="章节标题"
        class="min-w-0 flex-1"
        @update:model-value="emit('rename', $event)"
      />
      <Text size="xs" tone="muted" class="shrink-0 tabular-nums max-md:hidden">
        {{ stats.texts }} 段 · {{ stats.images }} 幅插图
      </Text>
      <Checkbox
        :model-value="chapter.included"
        size="sm"
        class="shrink-0"
        @update:model-value="value => emit('toggle', value === true)"
      >
        导入本章
      </Checkbox>
      <Button
        size="sm"
        variant="ghost"
        tone="neutral"
        :disabled="first"
        class="shrink-0"
        @click="emit('merge')"
      >
        <template #icon><ArrowUpToLine /></template>
        合并到上一章
      </Button>
    </Inline>
    <VirtualList
      :items="indexes"
      :get-key="index => index"
      :estimate-size="52"
      height="100%"
      label="段落"
      empty-text="本章无内容。"
      class="min-h-0 flex-1"
    >
      <template #default="{ item }">
        <WorkbenchNovelImportBlock
          :block="blocks[item]!"
          :number="item - chapter.from + 1"
          :titleable="canSplit(item, true)"
          :splittable="canSplit(item, false)"
          :lang="lang"
          @split="asTitle => emit('split', item, asTitle)"
        />
      </template>
    </VirtualList>
    <Inline
      gap="lg"
      align="center"
      :wrap="false"
      class="h-8 shrink-0 border-t border-line bg-subtle px-5"
    >
      <Inline gap="xs" align="center" :wrap="false" class="text-muted">
        <Heading class="size-3.5 shrink-0" aria-hidden="true" />
        <Text size="xs" tone="muted" truncate>将段落设置为新章节的标题</Text>
      </Inline>
      <Inline gap="xs" align="center" :wrap="false" class="text-muted max-md:hidden">
        <Scissors class="size-3.5 shrink-0" aria-hidden="true" />
        <Text size="xs" tone="muted" truncate>在段落之前拆分章节</Text>
      </Inline>
      <Text size="xs" tone="muted" class="ml-auto shrink-0 max-lg:hidden">点击标题进行编辑</Text>
    </Inline>
  </Stack>
</template>
