<script setup lang="ts">
  import { Button, Inline, Panel, Stack, Tag } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ClipboardCheck } from '@lucide/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  defineProps<{ entries?: CreatorOverviewPageData['review_entries'] }>()
  const { canAny } = useCreatorPermissions()
</script>

<template>
  <Panel v-if="canAny(WIKI_PERMISSIONS.REVIEW)" title="待你审核">
    <template #icon><ClipboardCheck /></template>
    <template #actions>
      <Button :as="NuxtLink" to="/create/review" variant="ghost" tone="neutral" size="sm">
        查看全部
      </Button>
    </template>
    <Stack v-if="entries?.length" gap="sm">
      <Inline v-for="entry in entries" :key="entry.id" gap="sm" align="center" :wrap="false">
        <CreatorContributionItem :contribution="entry.primary" class="min-w-0 flex-1" />
        <Tag v-if="entry.bundled.length" size="sm" tone="neutral" class="shrink-0">
          捆绑 {{ entry.bundled.length }} 个新实体
        </Tag>
      </Inline>
    </Stack>
    <CreatorEmpty v-else text="没有待审核的变更请求" />
  </Panel>
</template>
