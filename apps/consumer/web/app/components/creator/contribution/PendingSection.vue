<script setup lang="ts">
  import { Button, Panel, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { BackendChangeRequestList } from '~/features/creator/contribution'
  import { CircleEllipsis } from '@lucide/vue'

  defineProps<{ list?: BackendChangeRequestList }>()
</script>

<template>
  <Panel title="进行中的变更请求" :count="list?.meta.total_items ?? 0">
    <template #icon><CircleEllipsis /></template>
    <template #actions>
      <Button :as="NuxtLink" to="/create/contributions" variant="ghost" tone="neutral" size="sm">
        查看全部
      </Button>
    </template>
    <Stack v-if="list?.items.length" gap="sm">
      <CreatorContributionItem
        v-for="item in list.items ?? []"
        :key="item.id"
        :contribution="item"
      />
    </Stack>
    <CreatorEmpty v-else text="没有进行中的变更请求" />
  </Panel>
</template>
