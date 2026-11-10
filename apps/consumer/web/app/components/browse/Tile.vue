<script setup lang="ts">
  import { Card, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'BrowseTile' })
  defineProps<{
    to: string
    title: string
    translated?: boolean
    sub?: string
    cover?: HikariImageSource
    ratio: '3/4' | '2/3'
  }>()
</script>

<template>
  <NuxtLink
    :to="to"
    class="hn-state-layer relative -m-1.5 flex min-w-0 hn-interactive flex-col gap-2 rounded-xl p-1.5 hn-press-lg"
  >
    <Ripple />
    <Card
      :padded="false"
      :class="
        cn('overflow-hidden bg-subtle shadow-none', ratio === '3/4' ? 'aspect-3/4' : 'aspect-2/3')
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
    <Stack gap="none" class="min-w-0 gap-0.5 px-0.5">
      <Text
        size="sm"
        weight="medium"
        :lang="translated ? 'zh-CN' : 'ja'"
        class="line-clamp-2 leading-snug"
      >
        {{ title }}
      </Text>
      <Text v-if="sub" size="xs" tone="muted" truncate lang="ja">{{ sub }}</Text>
    </Stack>
  </NuxtLink>
</template>
