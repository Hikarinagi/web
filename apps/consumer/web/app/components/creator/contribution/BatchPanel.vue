<script setup lang="ts">
  import { Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Layers } from '@lucide/vue'
  import type { BackendChangeRequestSummary } from '~/features/creator/contribution'

  defineProps<{ batchMembers: BackendChangeRequestSummary[] }>()
</script>

<template>
  <Panel
    title="同批提交"
    :count="batchMembers.length"
    description="同一次提交捆绑的变更请求，审核裁决会应用于整批。"
  >
    <template #icon><Layers /></template>
    <Stack gap="none">
      <NuxtLink
        v-for="member in batchMembers"
        :key="member.id"
        :to="`/create/contributions/${member.id}`"
        class="hn-state-layer hn-interactive rounded-lg px-2 py-2"
      >
        <Inline gap="sm" align="center" justify="between" :wrap="false">
          <CreatorResourceHead
            :id="member.resource_id"
            size="sm"
            :type="member.resource_type"
            :resource="member.resource"
          />
          <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
            <Text as="span" size="sm" tone="muted" truncate class="max-w-72">
              {{ member.summary }}
            </Text>
            <CreatorStatusBadge :status="member.status" />
          </Inline>
        </Inline>
      </NuxtLink>
    </Stack>
  </Panel>
</template>
