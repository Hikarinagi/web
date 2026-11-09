<script setup lang="ts">
  import { Inline, Ripple, Stack, Text } from '@hina-ui/vue'
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
    gap="md"
    align="center"
    :wrap="false"
    class="hn-state-layer -mx-2 hn-interactive rounded-lg px-2 py-2"
  >
    <Ripple />
    <Text
      weight="semibold"
      :class="
        cn(
          'w-6 shrink-0 text-center text-lg tabular-nums',
          rank <= 3 ? 'text-accent-text' : 'text-muted',
        )
      "
    >
      {{ rank }}
    </Text>
    <HikariImage
      :src="work.cover"
      alt=""
      :ratio="ratio === '3/4' ? 3 / 4 : 2 / 3"
      :processing="{ width: 144, quality: 82, fit: 'cover' }"
      class="w-12 shrink-0 overflow-hidden rounded-md bg-subtle"
      image-class="object-cover object-top"
    />
    <Stack gap="none" class="min-w-0 flex-1 gap-1">
      <Text size="sm" weight="medium" class="line-clamp-2 leading-snug">{{ work.title }}</Text>
      <Text v-if="work.sub" size="xs" tone="muted" truncate>{{ work.sub }}</Text>
      <LandingScore v-if="score" :score="score" :rated="rated" />
      <Text v-else-if="note" size="xs" tone="muted" truncate class="tabular-nums">
        {{ note }}
      </Text>
    </Stack>
  </Inline>
</template>
