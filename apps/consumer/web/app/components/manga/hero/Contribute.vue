<script setup lang="ts">
  import { Button } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { BookUp } from '@lucide/vue'

  defineOptions({ name: 'MangaHeroContribute' })
  defineProps<{ mangaId: number }>()
</script>

<template>
  <Button
    :as="NuxtLink"
    :to="`/contribute?manga=${mangaId}`"
    variant="soft"
    tone="neutral"
    size="sm"
    class="self-center lg:self-start"
  >
    <template #icon><BookUp /></template>
    投稿章节
  </Button>
</template>
