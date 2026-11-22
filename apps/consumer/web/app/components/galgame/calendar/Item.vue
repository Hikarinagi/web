<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarItem' })
  const props = defineProps<{ item: Item }>()

  const work = computed(() => galgameWork(props.item))
  const platforms = computed(() =>
    sortPlatforms(props.item.platforms).map(platformLabel).join('、'),
  )
  const coverProcessing = { width: 360, quality: 84, fit: 'cover' } as const
</script>

<template>
  <Stack
    :as="NuxtLink"
    :to="work.to"
    gap="sm"
    class="hn-state-layer relative isolate -m-1.5 min-w-0 hn-interactive rounded-xl p-1.5 hn-press-lg"
  >
    <Ripple />
    <Card :padded="false" class="aspect-3/4 overflow-hidden bg-subtle shadow-none">
      <HikariImage
        :src="work.cover"
        :alt="work.title"
        :processing="coverProcessing"
        class="size-full"
        image-class="size-full object-cover object-top"
      />
    </Card>
    <Stack gap="none" class="min-w-0 gap-0.5">
      <Text size="sm" weight="medium" class="line-clamp-2 leading-snug">{{ work.title }}</Text>
      <Text v-if="work.sub" size="xs" tone="muted" truncate lang="ja">{{ work.sub }}</Text>
      <Inline gap="sm" align="baseline" justify="between" :wrap="false" class="min-w-0">
        <Text size="xs" tone="faint" truncate>{{ platforms }}</Text>
        <Text v-if="item.price" size="xs" weight="medium" class="shrink-0 tabular-nums">
          {{ yenLabel(item.price) }}
        </Text>
      </Inline>
    </Stack>
  </Stack>
</template>
