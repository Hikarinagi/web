<script setup lang="ts">
  import { Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { HikariImageSource } from '~/utils/media/image'

  defineOptions({ name: 'HikariContentNodesEntityCardBackdrop' })
  defineProps<{ src?: HikariImageSource }>()

  const processing = { blur: 60, brightness: 0.5, width: 600, quality: 75 } as const
</script>

<template>
  <Stack gap="none" class="pointer-events-none absolute inset-0 z-0">
    <HikariImage
      :src="src"
      alt=""
      :processing="processing"
      :skeleton="false"
      class="size-full"
      image-class="size-full object-cover scale-110"
    >
      <template #empty><VisuallyHidden /></template>
      <template #error><VisuallyHidden /></template>
    </HikariImage>

    <Stack
      gap="none"
      aria-hidden="true"
      class="absolute inset-0 bg-linear-to-r from-black/35 via-black/55 via-40% to-black/65"
    />
  </Stack>
</template>
