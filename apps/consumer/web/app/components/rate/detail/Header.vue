<script setup lang="ts">
  import { Inline, Stack, Time } from '@hina-ui/vue'
  import type { Component } from 'vue'
  import type { BackendRate } from '~/features/rate/permalink'

  defineOptions({ name: 'RateDetailHeader' })

  defineProps<{
    rater: BackendRate['rater']
    createdAt: string
    following: boolean
    statusLabel: string | null
    statusIcon: Component | null
    hours: number
  }>()
</script>

<template>
  <Inline gap="md">
    <Avatar :user="rater" card class="size-11! shrink-0" />
    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Inline gap="sm" class="text-sm">
        <UserName :user="rater" class="font-semibold text-fg" />
        <UserBadges :user="rater" />
      </Inline>
      <Inline gap="xs" class="text-xs text-muted">
        <Time :value="createdAt" format="relative" />
        <Inline v-if="statusLabel" gap="xs">
          <component :is="statusIcon" v-if="statusIcon" class="size-3" />
          {{ statusLabel }}
        </Inline>
        <template v-if="hours">· {{ hours }} 小时</template>
      </Inline>
    </Stack>
    <CommunityFollowButton :user-id="rater.id" :initial-following="following" />
  </Inline>
</template>
