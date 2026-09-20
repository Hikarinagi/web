<script setup lang="ts">
  import { timeFormat } from '#imports'
  import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

  defineProps<{ contribution: BackendChangeRequestSummary }>()
</script>

<template>
  <NuxtLink
    :to="`/create/contributions/${contribution.id}`"
    class="flex flex-col gap-2 rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
  >
    <div class="flex items-center justify-between gap-3">
      <CreatorResourceHead
        :id="contribution.resource_id"
        size="sm"
        :type="contribution.resource_type"
        :resource="contribution.resource"
        class="min-w-0 flex-1"
      />
      <CreatorStatusBadge :status="contribution.status" />
    </div>
    <p class="truncate text-sm text-surface-600 dark:text-surface-300">
      {{ contribution.summary }}
      <span class="text-xs text-muted-color">· {{ timeFormat(contribution.created_at) }}</span>
    </p>
  </NuxtLink>
</template>
