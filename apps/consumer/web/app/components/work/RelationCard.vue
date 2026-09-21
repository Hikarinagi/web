<script setup lang="ts">
  import { Link, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'WorkRelationCard' })
  withDefaults(
    defineProps<{
      to: string
      title: string
      label: string
      cover?: HikariImageSource
      year?: number | null
      aspect?: '3/4' | '7/10'
    }>(),
    { cover: undefined, year: null, aspect: '3/4' },
  )
</script>

<template>
  <Link
    :as="NuxtLink"
    :to="to"
    tone="neutral"
    :underline="false"
    class="group flex min-w-0 flex-col gap-2"
  >
    <Stack
      gap="none"
      class="relative overflow-hidden rounded-lg border border-line bg-subtle"
      :class="aspect === '7/10' ? 'aspect-7/10' : 'aspect-3/4'"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        :processing="{ quality: 82 }"
      >
        <template #empty><VisuallyHidden /></template>
        <template #error><VisuallyHidden /></template>
      </HikariImage>

      <Text
        as="span"
        size="xs"
        weight="medium"
        class="absolute top-1.5 left-1.5 rounded bg-black/70 px-1.5 py-0.5 text-white backdrop-blur-sm"
      >
        {{ label }}
      </Text>
    </Stack>

    <Stack gap="none" class="gap-0.5">
      <Text
        as="p"
        size="sm"
        weight="medium"
        truncate
        class="transition-colors group-hover:text-accent-text"
      >
        {{ title }}
      </Text>
      <Text v-if="year" as="p" size="xs" tone="muted">{{ year }}</Text>
    </Stack>
  </Link>
</template>
