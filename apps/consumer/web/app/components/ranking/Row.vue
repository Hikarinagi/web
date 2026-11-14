<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { ArrowDown, ArrowUp, Minus, Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { rowTone } from '~/features/entry/tone'
  import type { HikariImageSource } from '~/utils/media/image'
  import { imageSourceThumbHash } from '~/utils/media/image'

  defineOptions({ name: 'RankingRow' })
  const props = defineProps<{
    to: string
    rank: number
    previous: number | null
    title: string
    original?: string
    author?: string
    cover: HikariImageSource
    tags: string[]
    score: number | null
    detail?: string
    note?: string
    eager?: boolean
  }>()

  const MOVE_TONE = {
    up: 'text-success-text',
    down: 'text-danger-text',
    same: 'text-(color:--row-soft)',
    new: 'text-accent-text',
  }

  const tone = computed(() => rowTone(imageSourceThumbHash(props.cover)))
  const move = computed(() => {
    if (props.previous === null) return { kind: 'new' as const, text: '新上榜' }
    const step = props.previous - props.rank
    if (step > 0) return { kind: 'up' as const, text: String(step) }
    if (step < 0) return { kind: 'down' as const, text: String(-step) }
    return { kind: 'same' as const, text: '' }
  })
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="to"
    :padded="false"
    class="hn-state-layer relative isolate hn-interactive border-(--row-line) bg-(--row-bg) hn-press-lg"
    :style="tone"
  >
    <Ripple />
    <HikariImage
      :src="cover"
      alt=""
      :lazy="!eager"
      :processing="{ width: 1000, height: 224, fit: 'cover', gravity: 'face', quality: 78 }"
      class="absolute inset-y-0 right-0 -z-10 w-2/5 mask-l-from-60% max-sm:mask-l-from-0% max-sm:opacity-70 lg:w-1/2"
      image-class="size-full object-cover"
    />
    <Inline
      gap="none"
      align="center"
      :wrap="false"
      class="h-(--ranking-row-sm) sm:h-(--ranking-row)"
    >
      <Stack
        gap="none"
        align="center"
        class="w-(--ranking-rank-sm) shrink-0 gap-1 sm:w-(--ranking-rank)"
      >
        <Text
          as="span"
          class="text-xl leading-none font-black tracking-tight text-(color:--row-ink) tabular-nums sm:text-3xl"
        >
          {{ rank }}
        </Text>
        <Inline
          gap="none"
          align="center"
          :wrap="false"
          :class="
            cn(
              'h-5 font-semibold tabular-nums',
              move.kind === 'new' ? 'text-xs' : 'text-sm',
              MOVE_TONE[move.kind],
            )
          "
        >
          <ArrowUp v-if="move.kind === 'up'" class="size-4" aria-label="上升" />
          <ArrowDown v-else-if="move.kind === 'down'" class="size-4" aria-label="下降" />
          <Minus v-else-if="move.kind === 'same'" class="size-4" aria-label="持平" />
          {{ move.text }}
        </Inline>
      </Stack>
      <HikariImage
        :src="cover"
        :alt="`${title} 封面`"
        :lazy="!eager"
        :preload="eager"
        :ratio="3 / 4"
        :processing="{ width: 176, quality: 82, fit: 'cover' }"
        class="w-(--ranking-cover-sm) shrink-0 overflow-hidden rounded-md shadow-md ring-1 ring-fg/10 sm:w-(--ranking-cover)"
        image-class="object-cover"
      />
      <Stack gap="none" class="min-w-0 flex-1 justify-center gap-1.5 ps-3 sm:ps-4">
        <Text truncate class="text-base font-bold sm:text-lg">{{ title }}</Text>
        <Inline
          v-if="original || author"
          gap="none"
          :wrap="false"
          class="min-w-0 gap-3 text-(color:--row-soft) max-sm:hidden"
        >
          <Text v-if="original" size="xs" truncate lang="ja" class="min-w-0">{{ original }}</Text>
          <Text v-if="author" size="xs" lang="ja" class="shrink-0">{{ author }}</Text>
        </Inline>
        <Inline
          v-if="detail"
          gap="sm"
          :wrap="false"
          class="min-w-0 text-(color:--row-soft) sm:hidden"
        >
          <Text size="xs" truncate class="min-w-0">{{ detail }}</Text>
          <Text v-if="note" size="xs" class="shrink-0 tabular-nums">{{ note }}</Text>
        </Inline>
        <Inline v-if="tags.length || score !== null" gap="xs" :wrap="false" class="overflow-hidden">
          <Tag
            v-if="score !== null"
            tone="warning"
            class="shrink-0 gap-1 text-warning tabular-nums"
          >
            <Star class="size-3 fill-current" />
            {{ score.toFixed(1) }}
          </Tag>
          <Tag
            v-for="tag in tags"
            :key="tag"
            pill
            class="shrink-0 bg-(--row-chip) text-(color:--row-soft)"
          >
            {{ tag }}
          </Tag>
        </Inline>
      </Stack>
      <Stack gap="none" class="w-1/4 shrink-0 max-sm:w-1/6 lg:w-2/5" />
    </Inline>
    <Tag
      v-if="detail"
      pill
      size="md"
      class="absolute right-3 bottom-3 gap-2 bg-neutral-1000/60 text-white backdrop-blur-sm max-sm:hidden"
    >
      {{ detail }}
      <Text v-if="note" as="span" size="xs" class="text-white/70 tabular-nums">{{ note }}</Text>
    </Tag>
  </Card>
</template>
