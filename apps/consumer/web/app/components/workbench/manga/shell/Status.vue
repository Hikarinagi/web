<script setup lang="ts">
  import { Inline, Tag, Text } from '@hina-ui/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { PROJECT_STATUS_META } from '~/features/workbench/labels'
  import { projectStatusLabel } from '~/features/workbench/manga/labels'
  import type {
    BackendMangaPage,
    BackendMangaProject,
    BackendMangaRegion,
  } from '~/features/workbench/manga/manga'
  import { tally } from '~/features/workbench/manga/progress'

  const props = defineProps<{
    project: BackendMangaProject
    pages: BackendMangaPage[]
    regions: BackendMangaRegion[]
    online: components['schemas']['UserRefDto'][]
    returned: boolean
  }>()

  const label = computed(() => projectStatusLabel(props.project, props.returned))
  const tone = computed(() =>
    label.value === '已退回'
      ? 'warning'
      : (PROJECT_STATUS_META[props.project.status]?.tone ?? 'neutral'),
  )
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const totals = computed(() => tally(props.regions))
  const rendered = computed(() => props.pages.filter(page => page.rendered_url).length)
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="min-w-0">
    <Tag size="sm" :tone="tone" class="shrink-0">{{ label }}</Tag>
    <WorkbenchEditorStats
      v-if="translation && pages.length"
      :done="totals.done"
      :total="totals.total"
      unit="个文本框"
      noun="文本框"
      :machine="totals.machine"
      :assisted="totals.assisted"
      :threshold="project.machine_label_percent"
      :extra="[{ label: '已嵌字', value: `${rendered} / ${pages.length} 页` }]"
    />
    <Text v-else-if="pages.length" size="xs" tone="muted" class="shrink-0 tabular-nums">
      {{ pages.length }} 页
    </Text>
    <WorkbenchPresence :users="online" class="max-lg:hidden" />
  </Inline>
</template>
