<script setup lang="ts">
  import type { BackendChangeRequestList } from '~/features/creator/contribution'
  import { CircleEllipsis } from '@lucide/vue'

  defineProps<{ list?: BackendChangeRequestList }>()
</script>

<template>
  <CardPanel title="进行中的变更请求" :icon="CircleEllipsis" :count="list?.meta.total_items ?? 0">
    <template #actions>
      <Button
        as="router-link"
        to="/create/contributions"
        label="查看全部"
        size="small"
        variant="text"
      />
    </template>
    <div v-if="list?.items.length" class="flex flex-col gap-2">
      <CreatorContributionItem
        v-for="item in list.items ?? []"
        :key="item.id"
        :contribution="item"
      />
    </div>
    <CreatorEmpty v-else text="没有进行中的变更请求" />
  </CardPanel>
</template>
