<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceHeroBanner' })

  defineProps<{ cover: SpacePageData['profile']['head_cover'] }>()

  const processing = { width: 1920, height: 360, fit: 'cover', quality: 72 } as const
</script>

<template>
  <Flex class="relative h-40 w-full overflow-hidden bg-linear-120 from-inset to-accent/15 sm:h-52">
    <HikariImage
      v-if="cover"
      :src="cover.src"
      alt=""
      class="absolute inset-0 h-full w-full"
      image-class="object-cover"
      :processing="processing"
    />
  </Flex>
</template>
