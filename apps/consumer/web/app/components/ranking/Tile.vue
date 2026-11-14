<script setup lang="ts">
  import { HoverCard, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'RankingTile' })
  defineProps<{
    to: string
    rank: number
    previous: number | null
    title: string
    original?: string
    sub?: string
    cover: HikariImageSource
    intro?: string | null
  }>()
  defineSlots<{ detail?(): unknown; facts?(): unknown }>()
</script>

<template>
  <HoverCard side="right" align="start" :open-delay="500">
    <NuxtLink
      :to="to"
      class="hn-state-layer relative -m-2 flex min-w-0 hn-interactive flex-col gap-3 rounded-xl p-2 hn-press-lg"
    >
      <Ripple />
      <Stack gap="none" class="relative">
        <EntryBookCover :media="cover" :alt="title" :width="480" />
        <Inline
          gap="xs"
          align="center"
          :wrap="false"
          class="pointer-events-none absolute top-2 left-2"
        >
          <Tag
            variant="solid"
            :tone="rank <= 3 ? 'accent' : 'neutral'"
            class="min-w-6 justify-center tabular-nums shadow-sm"
          >
            {{ rank }}
          </Tag>
          <Inline
            align="center"
            :wrap="false"
            class="h-6 rounded-md bg-surface/90 px-1.5 shadow-sm backdrop-blur"
          >
            <RankingChange :rank="rank" :previous="previous" />
          </Inline>
        </Inline>
      </Stack>
      <Stack gap="none" class="min-w-0 gap-1">
        <Text
          weight="semibold"
          :lang="original ? 'zh-CN' : 'ja'"
          class="line-clamp-2 min-h-(--landing-lines-2) leading-snug"
        >
          {{ title }}
        </Text>
        <Text size="sm" tone="muted" truncate lang="ja" class="min-h-(--landing-line)">
          {{ sub }}
        </Text>
        <Inline gap="sm" align="center" :wrap="false" class="min-h-6 min-w-0">
          <slot name="detail" />
        </Inline>
      </Stack>
    </NuxtLink>
    <template #content>
      <Stack gap="sm" class="w-72">
        <Stack gap="xs">
          <Text weight="semibold" :lang="original ? 'zh-CN' : 'ja'">{{ title }}</Text>
          <Text v-if="original" size="xs" tone="muted" lang="ja">{{ original }}</Text>
        </Stack>
        <Inline v-if="$slots.facts" gap="md" align="center" class="gap-y-1">
          <slot name="facts" />
        </Inline>
        <Text v-if="intro" size="sm" tone="muted" class="line-clamp-5">{{ intro }}</Text>
      </Stack>
    </template>
  </HoverCard>
</template>
