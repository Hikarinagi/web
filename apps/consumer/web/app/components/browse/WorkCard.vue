<script setup lang="ts">
  import { Card, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'BrowseWorkCard' })

  withDefaults(
    defineProps<{
      to: string
      title: string
      sub: string
      cover?: HikariImageSource
      overlay?: string
      ratio?: '2/3' | '3/4'
    }>(),
    { cover: undefined, overlay: undefined, ratio: '2/3' },
  )
</script>

<template>
  <NuxtLink :to="to" class="group flex min-w-0 flex-col gap-2">
    <Card
      :padded="false"
      :class="
        cn(
          'relative bg-subtle shadow-none transition-colors duration-150 ease-out group-hover:border-line-strong',
          ratio === '3/4' ? 'aspect-3/4' : 'aspect-2/3',
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
      <Text
        size="sm"
        weight="semibold"
        truncate
        class="transition-colors duration-150 ease-out group-hover:text-accent-text"
      >
        {{ title }}
      </Text>
      <Text size="xs" tone="muted" truncate class="font-bold">{{ sub }}</Text>
    </Stack>
  </NuxtLink>
</template>
