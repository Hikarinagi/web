<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LandingRatio, LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingRow' })
  defineProps<{
    work: LandingWork
    rank: number
    ratio: LandingRatio
    score?: number | null
    rated?: number
    note?: string
  }>()
</script>

<template>
  <Inline
    :as="NuxtLink"
    :to="work.to"
    gap="sm"
    align="center"
    :wrap="false"
    class="hn-state-layer -mx-2 hn-interactive rounded-md px-2 py-1.5"
  >
    <Text size="sm" weight="semibold" tone="muted" class="w-5 shrink-0 text-center tabular-nums">
      {{ rank }}
    </Text>
    <HikariImage
      :src="work.cover"
      alt=""
      :ratio="ratio === '3/4' ? 3 / 4 : 2 / 3"
      :processing="{ width: 96, quality: 82, fit: 'cover' }"
      class="w-8 shrink-0 overflow-hidden rounded-sm bg-subtle"
      image-class="object-cover object-top"
    />
    <Text size="sm" truncate class="min-w-0 flex-1">{{ work.title }}</Text>
    <LandingScore v-if="score" :score="score" :rated="rated" class="shrink-0" />
    <Text v-else-if="note" size="xs" tone="muted" class="shrink-0 tabular-nums">{{ note }}</Text>
  </Inline>
</template>
