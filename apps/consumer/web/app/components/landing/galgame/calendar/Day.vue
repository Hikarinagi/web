<script setup lang="ts">
  import { Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { weekdayLabel } from '~/features/landing/labels'
  import type { LandingDay } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingGalgameCalendarDay' })
  const props = defineProps<{ day: LandingDay<ScheduleItem>; today: string }>()

  const month = computed(() => Number(props.day.date.slice(5, 7)))
  const date = computed(() => Number(props.day.date.slice(8, 10)))
  const works = computed(() => props.day.items.map(galgameWork))
  const coverProcessing = { width: 120, quality: 82, fit: 'cover' } as const
</script>

<template>
  <Stack gap="sm" class="w-60 shrink-0 snap-start">
    <Inline gap="sm" align="baseline" :wrap="false" class="border-b border-line pb-2">
      <Text size="2xl" weight="semibold" class="leading-none tabular-nums">{{ date }}</Text>
      <Text size="sm" tone="muted">{{ month }} 月 {{ weekdayLabel(day.date) }}</Text>
      <Tag v-if="day.date === today" tone="accent" size="sm" class="ms-auto self-center">
        今天
      </Tag>
    </Inline>
    <Stack gap="none">
      <Inline
        v-for="work in works"
        :key="work.id"
        :as="NuxtLink"
        :to="work.to"
        gap="sm"
        align="center"
        :wrap="false"
        class="hn-state-layer relative isolate -mx-2 hn-interactive rounded-lg px-2 py-1.5"
      >
        <Ripple />
        <HikariImage
          :src="work.cover"
          alt=""
          :ratio="0.75"
          :processing="coverProcessing"
          class="w-11 shrink-0 overflow-hidden rounded-sm ring-1 ring-fg/10"
          image-class="size-full object-cover"
        />
        <Stack gap="none" class="min-w-0">
          <Text size="sm" weight="medium" class="line-clamp-2 leading-snug">{{ work.title }}</Text>
          <Text size="xs" tone="muted" truncate lang="ja">{{ work.sub }}</Text>
        </Stack>
      </Inline>
    </Stack>
  </Stack>
</template>
