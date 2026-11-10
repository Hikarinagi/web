<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'BrowseRow' })
  defineProps<{
    to: string
    title: string
    original?: string
    cover?: HikariImageSource
    ratio: '3/4' | '2/3'
  }>()
  defineSlots<{ meta?(): unknown; extra?(): unknown }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="hn-state-layer relative block hn-interactive rounded-lg p-2 hn-press-lg"
  >
    <Ripple />
    <Inline gap="md" align="start" :wrap="false" class="min-w-0">
      <Card
        :padded="false"
        :class="
          cn(
            'shrink-0 overflow-hidden bg-subtle shadow-none',
            ratio === '3/4' ? 'aspect-3/4 w-16 max-sm:w-14' : 'aspect-2/3 w-14',
          )
        "
      >
        <HikariImage
          v-if="cover"
          :src="cover"
          :alt="title"
          class="size-full"
          image-class="size-full object-cover object-top"
          :processing="{ quality: 82 }"
        />
      </Card>
      <Stack gap="xs" class="min-w-0 flex-1 py-0.5">
        <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
          <Text
            size="sm"
            weight="medium"
            truncate
            :lang="original ? 'zh-CN' : 'ja'"
            class="min-w-0 shrink"
          >
            {{ title }}
          </Text>
          <Text v-if="original" size="xs" tone="muted" truncate lang="ja" class="min-w-0 flex-1">
            {{ original }}
          </Text>
        </Inline>
        <Inline gap="md" :wrap="false" class="min-w-0">
          <slot name="meta" />
        </Inline>
        <Inline
          v-if="$slots.extra"
          gap="sm"
          align="center"
          :wrap="false"
          class="min-w-0 overflow-hidden"
        >
          <slot name="extra" />
        </Inline>
      </Stack>
    </Inline>
  </NuxtLink>
</template>
