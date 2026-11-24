<script setup lang="ts">
  import { Alert, Text } from '@hina-ui/vue'
  import { placementHeading } from '~/features/workbench/manga/placement'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  const props = defineProps<{ project: WorkbenchMangaProjectPageData['project'] }>()

  const reviewing = computed(() => !!props.project.viewer_role && props.project.status === 'REVIEW')
  const retrying = computed(
    () => props.project.mode === 'UPLOAD' && props.project.placement?.problem === 'failed',
  )
  const judging = computed(
    () =>
      reviewing.value &&
      !props.project.placement_complete &&
      (!props.project.placement || retrying.value),
  )
  const pending = computed(
    () => props.project.mode === 'TRANSLATION' && !props.project.placement?.applied,
  )
</script>

<template>
  <Alert :open="judging" tone="info" :closable="false">正在确定所在的卷或话。</Alert>
  <Alert
    :open="reviewing && !!project.placement && !retrying"
    tone="info"
    :closable="false"
    title="位置"
  >
    <Text v-if="project.placement" size="sm">
      {{ placementHeading(project.placement) }}{{ pending ? '，待审核员确定' : '' }}
    </Text>
  </Alert>
</template>
