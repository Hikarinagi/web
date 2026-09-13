<script setup lang="ts">
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ClipboardCheck } from '@lucide/vue'
  import type { CreatorOverviewPageData } from '~~/server/api/pages/create/overview.get'

  defineProps<{ entries?: CreatorOverviewPageData['review_entries'] }>()
  const { canAny } = useCreatorPermissions()
</script>

<template>
  <CardPanel v-if="canAny(WIKI_PERMISSIONS.REVIEW)" title="待你审核" :icon="ClipboardCheck">
    <template #actions>
      <Button as="router-link" to="/create/review" label="查看全部" size="small" variant="text" />
    </template>
    <div v-if="entries?.length" class="flex flex-col gap-2">
      <div v-for="entry in entries" :key="entry.id" class="flex items-center gap-2">
        <CreatorContributionItem :contribution="entry.primary" class="min-w-0 flex-1" />
        <Tag
          v-if="entry.bundled.length"
          :value="`捆绑 ${entry.bundled.length} 个新实体`"
          severity="secondary"
          class="shrink-0"
        />
      </div>
    </div>
    <CreatorEmpty v-else text="没有待审核的变更请求" />
  </CardPanel>
</template>
