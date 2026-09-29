<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    project: WorkbenchProjectPageData['project']
    chapters: WorkbenchProjectPageData['chapters']
    online: components['schemas']['UserRefDto'][]
  }>()

  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const totals = computed(() =>
    props.chapters.reduce(
      (sum, chapter) => ({
        segments: sum.segments + chapter.segment_count,
        done: sum.done + chapter.done_count,
        machine: sum.machine + chapter.machine_count,
        assisted: sum.assisted + chapter.assisted_count,
      }),
      { segments: 0, done: 0, machine: 0, assisted: 0 },
    ),
  )
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="min-w-0">
    <WorkbenchEditorStats
      v-if="translation && totals.segments"
      :done="totals.done"
      :total="totals.segments"
      unit="段"
      noun="段落"
      :machine="totals.machine"
      :assisted="totals.assisted"
      :threshold="project.machine_label_percent"
    />
    <Text v-else-if="totals.segments" size="xs" tone="muted" class="shrink-0 tabular-nums">
      {{ chapters.length }} 章 · {{ totals.segments }} 段
    </Text>
    <WorkbenchPresence :users="online" class="max-lg:hidden" />
  </Inline>
</template>
