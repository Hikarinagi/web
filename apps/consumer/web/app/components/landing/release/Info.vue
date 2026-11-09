<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { CalendarDays, JapaneseYen, MonitorSmartphone } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { dayLabel, weekdayLabel, yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseInfo' })
  const props = defineProps<{ item: ScheduleItem }>()

  const work = computed(() => galgameWork(props.item))
  const meta = computed(() => {
    const date = props.item.release_date?.slice(0, 10)
    return [
      {
        icon: CalendarDays,
        text: date ? `${dayLabel(date)}${weekdayLabel(date)}` : '',
        fill: false,
      },
      {
        icon: MonitorSmartphone,
        text: sortPlatforms(props.item.platforms).map(platformLabel).join('、'),
        fill: true,
      },
      { icon: JapaneseYen, text: props.item.price ? yenLabel(props.item.price) : '', fill: false },
    ].filter(entry => entry.text)
  })
</script>

<template>
  <Stack gap="xs" class="min-w-0 pt-2">
    <Text size="sm" tone="muted" truncate class="min-h-(--landing-line)">{{ work.sub }}</Text>
    <Heading :level="3" class="truncate text-2xl leading-tight font-bold lg:text-3xl">
      {{ work.title }}
    </Heading>
    <Text size="sm" tone="muted" truncate class="min-h-(--landing-line)">{{ work.original }}</Text>
    <Inline gap="md" :wrap="false" class="mt-1 min-h-(--landing-line) min-w-0">
      <Inline
        v-for="entry in meta"
        :key="entry.text"
        gap="xs"
        align="center"
        :wrap="false"
        :class="entry.fill ? 'min-w-0' : 'shrink-0'"
      >
        <component :is="entry.icon" class="size-4 shrink-0 text-muted" />
        <Text size="sm" truncate class="text-fg/90 tabular-nums">{{ entry.text }}</Text>
      </Inline>
    </Inline>
  </Stack>
  <Inline gap="sm" :wrap="false">
    <LandingReleaseMark :key="item.id" :galgame-id="item.id" />
    <Button :as="NuxtLink" :to="work.to" variant="soft" tone="neutral">查看详情</Button>
  </Inline>
</template>
