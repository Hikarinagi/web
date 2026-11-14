<script setup lang="ts">
  import { Heading, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { ageRatingLabel } from '~/features/entry/labels'
  import { coverRatio } from '~/features/galgame/calendar'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarSpot' })
  const props = defineProps<{ item: Item }>()

  const work = computed(() => galgameWork(props.item))
  const ratio = computed(() => coverRatio(props.item))
  const platforms = computed(() => sortPlatforms(props.item.platforms).map(platformLabel))
  const age = computed(() =>
    props.item.age_rating === 'R18' ? null : ageRatingLabel(props.item.age_rating),
  )
  const filled = computed(() => !!props.item.intro || props.item.images.length > 0)
</script>

<template>
  <Inline
    :as="NuxtLink"
    :to="work.to"
    gap="lg"
    align="stretch"
    :wrap="false"
    class="hn-state-layer relative isolate -m-2 min-w-0 hn-interactive rounded-xl p-2 hn-press-lg max-lg:flex-col"
  >
    <Ripple />
    <Stack
      gap="none"
      class="relative min-h-(--calendar-spot-cover) max-w-1/2 shrink-0 overflow-hidden rounded-lg bg-subtle shadow-lg ring-1 ring-fg/10 max-lg:h-64 max-lg:min-h-0 max-lg:max-w-full max-lg:self-start"
      :style="{ aspectRatio: ratio }"
    >
      <HikariImage
        :src="work.cover"
        :alt="`${work.title} 封面`"
        :processing="{ width: 720, quality: 84, fit: 'scale-down' }"
        class="absolute inset-0 size-full"
        image-class="size-full object-cover"
      />
    </Stack>
    <Stack gap="md" :class="cn('min-w-0 flex-1', filled ? 'justify-between' : 'justify-center')">
      <Stack gap="sm" class="min-w-0">
        <Stack gap="xs">
          <Heading :level="3" class="text-2xl leading-snug font-bold text-balance max-sm:text-xl">
            {{ work.title }}
          </Heading>
          <Text v-if="work.original" size="sm" tone="faint" lang="ja">{{ work.original }}</Text>
        </Stack>
        <Text v-if="work.sub" tone="muted">{{ work.sub }}</Text>
        <Inline gap="sm" align="center">
          <Tag v-for="name in platforms" :key="name" variant="outline" tone="neutral">
            {{ name }}
          </Tag>
          <Tag v-if="age" tone="accent">{{ age }}</Tag>
          <Text v-if="item.price" weight="semibold" class="font-mono tabular-nums">
            {{ yenLabel(item.price) }}
          </Text>
        </Inline>
      </Stack>
      <Stack v-if="filled" gap="sm" class="min-w-0">
        <Text
          v-if="item.intro"
          size="sm"
          tone="muted"
          class="line-clamp-4 max-w-(--calendar-spot-text) leading-relaxed"
        >
          {{ item.intro }}
        </Text>
        <Inline v-if="item.images.length" gap="sm" :wrap="false" class="overflow-hidden">
          <HikariImage
            v-for="image in item.images"
            :key="image.id"
            :src="image"
            alt=""
            :processing="{ width: 240, quality: 80, fit: 'cover' }"
            class="aspect-video h-15 shrink-0 overflow-hidden rounded-sm ring-1 ring-fg/10"
            image-class="object-cover"
          />
        </Inline>
      </Stack>
    </Stack>
  </Inline>
</template>
