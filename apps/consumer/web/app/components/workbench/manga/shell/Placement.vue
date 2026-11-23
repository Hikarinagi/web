<script setup lang="ts">
  import { Alert, Stack, Text } from '@hina-ui/vue'
  import { placementLine, placementOutcome } from '~/features/workbench/manga/placement'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  const props = defineProps<{ project: WorkbenchMangaProjectPageData['project'] }>()

  const reviewing = computed(() => !!props.project.viewer_role && props.project.status === 'REVIEW')
  const judging = computed(
    () => reviewing.value && !props.project.placement && !props.project.placement_complete,
  )
</script>

<template>
  <Alert :open="judging" tone="info" :closable="false">
    正在判断这份文件放在哪一卷或哪几话，判断完成后交给审核员。
  </Alert>
  <Alert
    :open="reviewing && !!project.placement"
    :tone="project.placement?.applied ? 'success' : 'warning'"
    :closable="false"
    title="系统判定的位置"
  >
    <Stack v-if="project.placement" gap="xs">
      <Text size="sm">{{ placementLine(project.placement) }}</Text>
      <Text size="sm" tone="muted">{{ placementOutcome(project.placement) }}。</Text>
    </Stack>
  </Alert>
</template>
