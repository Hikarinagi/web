<script setup lang="ts">
  import { Button, Inline, Panel, Progress, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { timeFormat } from '#imports'
  import { FolderKanban } from '@lucide/vue'
  import { PROJECT_MODE_LABEL } from '~/features/workbench/labels'
  import { MANGA_MODE_LABEL } from '~/features/workbench/manga/labels'
  import { projectTitle, seriesHead } from '~/features/workbench/manga/series'
  import { volumeHead } from '~/features/workbench/volume'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  const props = defineProps<{
    novels: CreatorOverviewPageData['novels']
    mangas: CreatorOverviewPageData['mangas']
  }>()

  const items = computed(() =>
    [
      ...props.novels.map(item => ({
        key: `novel-${item.id}`,
        to: `/create/projects/${item.id}`,
        id: item.volume.id,
        type: 'LIGHT_NOVEL_VOLUME' as const,
        resource: volumeHead(item.volume),
        mode: PROJECT_MODE_LABEL[item.mode],
        status: item.status,
        done: item.mode === 'TRANSLATION' ? item.progress.done : null,
        total: item.progress.segments,
        at: item.last_activity_at,
      })),
      ...props.mangas.map(item => ({
        key: `manga-${item.id}`,
        to: `/create/manga/${item.id}`,
        id: item.series.id,
        type: 'MANGA' as const,
        resource: { ...seriesHead(item.series), title: projectTitle(item) },
        mode: MANGA_MODE_LABEL[item.mode],
        status: item.status,
        done: item.mode === 'TRANSLATION' ? item.progress.rendered : null,
        total: item.progress.pages,
        at: item.last_activity_at,
      })),
    ]
      .sort((left, right) => right.at.localeCompare(left.at))
      .slice(0, 5),
  )
</script>

<template>
  <Panel title="正在进行的投稿">
    <template #icon><FolderKanban /></template>
    <template #actions>
      <Button :as="NuxtLink" to="/create/projects" variant="ghost" tone="neutral" size="sm">
        查看全部
      </Button>
    </template>
    <Stack v-if="items.length" gap="sm">
      <NuxtLink
        v-for="item in items"
        :key="item.key"
        :to="item.to"
        class="hn-state-layer flex hn-interactive flex-col gap-2 rounded-lg px-3 py-2.5"
      >
        <Inline gap="sm" align="center" justify="between" :wrap="false">
          <CreatorResourceHead
            :id="item.id"
            size="sm"
            :type="item.type"
            :resource="item.resource"
            class="min-w-0 flex-1"
          />
          <Progress
            v-if="item.done !== null"
            :value="item.done"
            :max="Math.max(item.total, 1)"
            size="sm"
            class="w-24 shrink-0"
          />
          <WorkbenchProjectStatusTag :status="item.status" class="shrink-0" />
        </Inline>
        <Text size="xs" tone="muted">{{ item.mode }} · {{ timeFormat(item.at) }}</Text>
      </NuxtLink>
    </Stack>
    <CreatorEmpty v-else text="没有正在进行的投稿。" />
  </Panel>
</template>
