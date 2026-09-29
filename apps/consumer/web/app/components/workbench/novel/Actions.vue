<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { NotebookPen, Sparkles } from '@lucide/vue'
  import { NOVEL_GUIDE } from '~/features/workbench/guide'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    project: WorkbenchProjectPageData['project']
    chapters: WorkbenchProjectPageData['chapters']
  }>()
  const emit = defineEmits<{ changed: []; glossary: []; ai: []; manage: [action: string] }>()

  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const canTranslate = computed(
    () =>
      props.project.viewer_capabilities.includes('translate') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )
  const totals = computed(() =>
    props.chapters.reduce(
      (sum, chapter) => ({
        segments: sum.segments + chapter.segment_count,
        done: sum.done + chapter.done_count,
      }),
      { segments: 0, done: 0 },
    ),
  )
  const blocker = computed(() => {
    if (!totals.value.segments) return '还没有正文'
    const remaining = totals.value.segments - totals.value.done
    return translation.value && remaining > 0 ? `还有 ${remaining} 段未翻译` : ''
  })
</script>

<template>
  <Inline gap="xs" align="center" :wrap="false" class="shrink-0">
    <Question title="使用说明" size="lg" aria-label="查看使用说明">
      <WorkbenchGuide :sections="NOVEL_GUIDE[project.mode]" />
    </Question>
    <Button
      v-if="translation"
      size="sm"
      variant="ghost"
      tone="neutral"
      class="max-md:hidden"
      @click="emit('glossary')"
    >
      <template #icon><NotebookPen /></template>
      术语表
    </Button>
    <Button
      v-if="translation && canTranslate && chapters.length"
      size="sm"
      variant="soft"
      class="max-md:hidden"
      @click="emit('ai')"
    >
      <template #icon><Sparkles /></template>
      AI 翻译
    </Button>
    <WorkbenchSubmitActions
      kind="novel"
      :project="project"
      :blocker="blocker"
      @changed="emit('changed')"
    />
    <WorkbenchNovelMenu :project="project" @select="action => emit('manage', action)" />
  </Inline>
</template>
