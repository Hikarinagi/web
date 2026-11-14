<script setup lang="ts">
  import { Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'RankingRow' })
  defineProps<{
    to: string
    rank: number
    previous: number | null
    title: string
    original?: string
    cover?: HikariImageSource
    intro?: string | null
  }>()
  defineSlots<{ meta?(): unknown; aside?(): unknown }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="hn-state-layer relative -mx-2 block hn-interactive rounded-lg px-2 py-3 hn-press-lg"
  >
    <Ripple />
    <Inline gap="md" align="center" :wrap="false" class="min-w-0">
      <Stack gap="xs" align="center" class="w-10 shrink-0">
        <Text
          weight="semibold"
          :class="
            cn('text-2xl leading-none tabular-nums', rank <= 3 ? 'text-accent-text' : 'text-muted')
          "
        >
          {{ rank }}
        </Text>
        <RankingChange :rank="rank" :previous="previous" />
      </Stack>
      <HikariImage
        :src="cover"
        alt=""
        :ratio="2 / 3"
        :processing="{ width: 168, quality: 82, fit: 'cover' }"
        class="w-14 shrink-0 overflow-hidden rounded-md bg-subtle"
        image-class="object-cover object-top"
      />
      <Stack gap="xs" class="min-w-0 flex-1">
        <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
          <Text weight="medium" truncate :lang="original ? 'zh-CN' : 'ja'" class="min-w-0 shrink">
            {{ title }}
          </Text>
          <Text
            v-if="original"
            size="xs"
            tone="muted"
            truncate
            lang="ja"
            class="min-w-0 flex-1 max-sm:hidden"
          >
            {{ original }}
          </Text>
        </Inline>
        <Inline gap="md" align="center" :wrap="false" class="min-w-0 overflow-hidden">
          <slot name="meta" />
        </Inline>
        <Inline
          v-if="$slots.aside"
          gap="md"
          align="center"
          :wrap="false"
          class="min-w-0 overflow-hidden md:hidden"
        >
          <slot name="aside" />
        </Inline>
        <Text v-if="intro" size="sm" tone="muted" class="line-clamp-1 md:line-clamp-2">
          {{ intro }}
        </Text>
      </Stack>
      <Stack gap="xs" align="end" class="w-36 shrink-0 max-md:hidden">
        <slot name="aside" />
      </Stack>
    </Inline>
  </NuxtLink>
</template>
