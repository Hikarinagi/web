<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

  defineProps<{ contribution: BackendChangeRequestSummary }>()
</script>

<template>
  <NuxtLink
    :to="`/create/contributions/${contribution.id}`"
    class="hn-state-layer flex hn-interactive flex-col gap-2 rounded-lg px-3 py-2.5"
  >
    <Inline gap="sm" align="center" justify="between" :wrap="false">
      <CreatorResourceHead
        :id="contribution.resource_id"
        size="sm"
        :type="contribution.resource_type"
        :resource="contribution.resource"
        class="min-w-0 flex-1"
      />
      <CreatorStatusBadge :status="contribution.status" />
    </Inline>
    <Text size="sm" truncate>
      {{ contribution.summary }}
      <Text as="span" size="xs" tone="muted">· {{ timeFormat(contribution.created_at) }}</Text>
    </Text>
  </NuxtLink>
</template>
