<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import { BookImage } from '@lucide/vue'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'EntryBookCover' })
  withDefaults(
    defineProps<{
      media: HikariImageSource
      alt: string
      preload?: boolean
      preview?: boolean
      width?: number
    }>(),
    { preload: false, preview: false, width: 360 },
  )
</script>

<template>
  <Stack
    gap="none"
    class="relative overflow-hidden rounded-l-xs rounded-r-md bg-subtle shadow-md ring-1 ring-black/5"
  >
    <HikariImage
      v-if="media"
      :src="media"
      :alt="alt"
      :ratio="7 / 10"
      :preload="preload"
      :preview="preview"
      :processing="{ width, quality: 86, fit: 'cover', format: 'auto' }"
      class="w-full"
      image-class="object-cover"
    />
    <Stack
      v-else
      gap="xs"
      align="center"
      justify="center"
      class="aspect-7/10 w-full text-faint"
      role="img"
      :aria-label="alt"
    >
      <BookImage class="size-6" />
      <Text size="xs" tone="faint">暂无封面</Text>
    </Stack>
    <Stack
      gap="none"
      class="pointer-events-none absolute inset-y-0 left-0 w-2 bg-linear-to-r from-black/30 via-white/15 to-transparent"
    />
  </Stack>
</template>
