<script setup lang="ts">
  import { Card, Panel, Ripple, SimpleGrid, Statistic } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { WIKI_PERMISSIONS, WORKBENCH_PERMISSIONS } from '@hikarinagi/shared'
  import { ClipboardCheck } from '@lucide/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  const props = defineProps<{ counts: CreatorOverviewPageData['review_counts'] }>()
  const { canAny } = useCreatorPermissions()

  const queues = computed(() =>
    [
      {
        label: '变更请求',
        to: '/create/review',
        value: props.counts.change_requests,
        permission: WIKI_PERMISSIONS.REVIEW,
      },
      {
        label: '小说投稿',
        to: '/create/project-review',
        value: props.counts.novel_projects,
        permission: WORKBENCH_PERMISSIONS.REVIEW_NOVEL,
      },
      {
        label: '漫画投稿',
        to: '/create/manga-review',
        value: props.counts.manga_projects,
        permission: WORKBENCH_PERMISSIONS.REVIEW_MANGA,
      },
    ].filter(queue => canAny(queue.permission)),
  )
</script>

<template>
  <Panel v-if="queues.length" title="待你审核">
    <template #icon><ClipboardCheck /></template>
    <SimpleGrid min="12rem" gap="md">
      <Card
        v-for="queue in queues"
        :key="queue.to"
        :as="NuxtLink"
        :to="queue.to"
        class="hn-state-layer hn-interactive hn-press-lg"
      >
        <Ripple />
        <Statistic :label="queue.label" :value="queue.value" />
      </Card>
    </SimpleGrid>
  </Panel>
</template>
