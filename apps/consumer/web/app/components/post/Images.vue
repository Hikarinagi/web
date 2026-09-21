<script setup lang="ts">
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'

  const props = defineProps<{ covers: PostPageData['post']['covers'] }>()

  const coverAspect = computed(() => {
    const m = props.covers[0]?.media
    return m?.width && m?.height ? m.width / m.height : 4 / 3
  })
</script>

<template>
  <HikariImage
    v-if="covers.length === 1"
    :src="covers[0]!.media"
    alt="帖子配图"
    class="max-h-125 w-full overflow-hidden rounded-xl"
    :ratio="coverAspect"
    image-class="size-full object-cover"
    :processing="{ q: 90 }"
    preview
  />
  <PostImageSwiper v-else-if="covers.length > 1" :covers="covers" />
</template>
