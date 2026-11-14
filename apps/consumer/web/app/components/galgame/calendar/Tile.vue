<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { ageRatingLabel } from '~/features/entry/labels'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  defineOptions({ name: 'GalgameCalendarTile' })
  const props = defineProps<{
    item: GalgamesCalendarPageData['calendar']['items'][number]
    label?: string
    badge?: string
    today?: boolean
    upcoming?: boolean
  }>()

  const work = computed(() => galgameWork(props.item))
  const facts = computed(() =>
    [
      ...sortPlatforms(props.item.platforms).map(platformLabel),
      props.item.age_rating === 'R18' ? null : ageRatingLabel(props.item.age_rating),
    ]
      .filter(Boolean)
      .join(' '),
  )
</script>

<template>
  <NuxtLink
    :to="work.to"
    class="hn-state-layer relative -m-2 flex min-w-0 hn-interactive flex-col gap-3 rounded-xl p-2 hn-press-lg"
  >
    <Ripple />
    <Stack gap="none" class="relative">
      <Card :padded="false" class="aspect-3/4 overflow-hidden bg-subtle shadow-md">
        <HikariImage
          v-if="work.cover"
          :src="work.cover"
          :alt="work.title"
          :processing="{ width: 480, quality: 86, fit: 'cover' }"
          class="size-full"
          image-class="size-full object-cover object-top"
        />
      </Card>
      <Inline
        v-if="label"
        gap="xs"
        align="center"
        :wrap="false"
        class="pointer-events-none absolute top-2 left-2"
      >
        <Tag variant="solid" :tone="upcoming ? 'accent' : 'neutral'" class="tabular-nums shadow-sm">
          {{ label }}
        </Tag>
        <Text
          v-if="badge"
          as="span"
          size="xs"
          weight="medium"
          class="inline-flex h-6 items-center rounded-md bg-surface/90 px-1.5 tabular-nums shadow-sm backdrop-blur"
        >
          {{ badge }}
        </Text>
      </Inline>
    </Stack>
    <Stack gap="none" class="min-w-0 gap-1">
      <Text
        weight="semibold"
        :lang="work.original ? 'zh-CN' : 'ja'"
        class="line-clamp-2 min-h-(--landing-lines-2) leading-snug"
      >
        {{ work.title }}
      </Text>
      <Text size="sm" tone="muted" truncate lang="ja" class="min-h-(--landing-line)">
        {{ work.sub }}
      </Text>
      <Inline
        gap="sm"
        align="center"
        justify="between"
        :wrap="false"
        class="min-h-(--landing-line) min-w-0"
      >
        <Text size="sm" tone="faint" truncate class="min-w-0">{{ facts }}</Text>
        <Text v-if="item.price" size="sm" tone="muted" class="shrink-0 tabular-nums">
          {{ yenLabel(item.price) }}
        </Text>
      </Inline>
    </Stack>
  </NuxtLink>
</template>
