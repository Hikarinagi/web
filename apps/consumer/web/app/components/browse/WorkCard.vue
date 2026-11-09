<script setup lang="ts">
  import { Card, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'BrowseWorkCard' })

  withDefaults(
    defineProps<{
      to: string
      title: string
      sub?: string
      cover?: HikariImageSource
      overlay?: string
      ratio?: '2/3' | '3/4'
      plainSub?: boolean
    }>(),
    { sub: undefined, cover: undefined, overlay: undefined, ratio: '2/3', plainSub: false },
  )
</script>

<template>
  <NuxtLink
    :to="to"
    class="hn-state-layer -m-2 flex min-w-0 hn-interactive flex-col gap-2 rounded-xl p-2 hn-press-lg"
  >
    <Ripple />
    <Card
      :padded="false"
      :class="cn('relative bg-subtle shadow-none', ratio === '3/4' ? 'aspect-3/4' : 'aspect-2/3')"
    >
      <HikariImage
        v-if="cover"
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="size-full object-cover object-top"
        :processing="{ quality: 82 }"
      />
      <Tag
        v-if="overlay"
        variant="solid"
        tone="neutral"
        size="sm"
        class="absolute right-1.5 bottom-1.5 backdrop-blur-sm"
      >
        {{ overlay }}
      </Tag>
    </Card>
    <Stack gap="none" class="min-w-0 gap-1">
      <Text size="sm" weight="semibold" truncate>{{ title }}</Text>
      <Text
        v-if="sub !== undefined"
        size="xs"
        tone="muted"
        truncate
        :class="plainSub ? '' : 'font-bold'"
      >
        {{ sub }}
      </Text>
      <slot name="meta" />
    </Stack>
  </NuxtLink>
</template>
