<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroBanner' })

  defineProps<{ cover: SpacePageData['profile']['head_cover'] }>()

  const processing = { width: 1920, height: 360, fit: 'cover', quality: 72 } as const
</script>

<template>
  <div class="relative h-40 w-full overflow-hidden sm:h-52">
    <HikariImage
      v-if="cover"
      :src="cover.src"
      alt=""
      class="absolute inset-0 h-full w-full"
      image-class="object-cover"
      :processing="processing"
    />
    <div
      v-else
      class="absolute inset-0 bg-[linear-gradient(120deg,var(--p-surface-200)_0%,rgba(57,197,187,0.18)_100%)] dark:bg-[linear-gradient(120deg,var(--p-surface-800)_0%,rgba(57,197,187,0.12)_100%)]"
    />
  </div>
</template>
