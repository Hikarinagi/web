<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel, weekdayLabel } from '~/features/landing/labels'
  import type { LandingDay } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingGalgameCalendarDay' })
  const props = defineProps<{ day: LandingDay<ScheduleItem>; today: string }>()

  const isToday = computed(() => props.day.date === props.today)
  const works = computed(() => props.day.items.map(galgameWork))
  const coverProcessing = { width: 300, quality: 84, fit: 'cover' } as const
</script>

<template>
  <Stack gap="md" class="shrink-0">
    <Inline gap="sm" align="baseline" :wrap="false">
      <Text size="sm" weight="semibold" class="tabular-nums">{{ dayLabel(day.date) }}</Text>
      <Text size="sm" tone="muted">{{ weekdayLabel(day.date) }}</Text>
      <Text v-if="isToday" size="sm" weight="medium" class="text-accent-text">今天</Text>
    </Inline>
    <Inline gap="lg" align="start" :wrap="false">
      <NuxtLink
        v-for="work in works"
        :key="work.id"
        :to="work.to"
        class="hn-state-layer relative isolate -m-1.5 flex w-35 shrink-0 hn-interactive flex-col gap-2 rounded-xl p-1.5 hn-press-lg"
      >
        <Ripple />
        <Card :padded="false" class="aspect-3/4 bg-subtle shadow-none">
          <HikariImage
            :src="work.cover"
            :alt="work.title"
            :processing="coverProcessing"
            class="size-full"
            image-class="size-full object-cover object-top"
          />
        </Card>
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium" class="line-clamp-2 leading-snug">{{ work.title }}</Text>
          <Text size="xs" tone="muted" truncate lang="ja">{{ work.sub }}</Text>
        </Stack>
      </NuxtLink>
    </Inline>
  </Stack>
</template>
