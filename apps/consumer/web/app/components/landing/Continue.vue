<script setup lang="ts">
  import { Card, Grid, Inline, Progress, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LandingRatio, LandingWork } from '~/features/landing/works'

  export interface LandingContinueItem {
    work: LandingWork
    to: string
    chapter?: string
    note?: string
    progress?: number
  }

  defineOptions({ name: 'LandingContinue' })
  defineProps<{ items: LandingContinueItem[]; ratio: LandingRatio }>()
</script>

<template>
  <ScrollRail class="-mx-4 -my-1 sm:mx-0">
    <Grid
      gap="sm"
      class="w-max auto-cols-(--landing-card) grid-flow-col grid-cols-none px-4 py-1 sm:px-0 lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-4"
    >
      <Card
        v-for="item in items"
        :key="item.work.id"
        :as="NuxtLink"
        :to="item.to"
        :padded="false"
        class="hn-state-layer min-w-0 hn-interactive hn-press-lg"
      >
        <Ripple />
        <Inline gap="md" align="center" :wrap="false" class="p-2">
          <HikariImage
            :src="item.work.cover"
            :alt="item.work.title"
            :ratio="ratio === '3/4' ? 3 / 4 : 2 / 3"
            :processing="{ width: 160, quality: 82, fit: 'cover' }"
            class="w-14 shrink-0 overflow-hidden rounded-md bg-subtle"
            image-class="object-cover object-top"
          />
          <Stack gap="xs" class="min-w-0 flex-1">
            <Text weight="medium" truncate>{{ item.work.title }}</Text>
            <Text v-if="item.chapter" size="sm" truncate class="text-accent-text tabular-nums">
              {{ item.chapter }}
            </Text>
            <Text v-if="item.note" size="sm" tone="muted" truncate class="tabular-nums">
              {{ item.note }}
            </Text>
            <Progress
              v-if="item.progress"
              :value="Math.round(item.progress * 100)"
              size="sm"
              :aria-label="item.note"
            />
          </Stack>
        </Inline>
      </Card>
    </Grid>
  </ScrollRail>
</template>
