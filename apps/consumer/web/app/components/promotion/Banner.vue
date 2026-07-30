<script setup lang="ts">
  import type { PromoBanner } from '~/features/promotion/placement'

  defineOptions({ name: 'PromotionBanner' })

  const props = defineProps<{ banner: PromoBanner }>()

  const aspectStyle = computed(() => {
    const { width, height } = props.banner.image
    return width && height ? { aspectRatio: `${width} / ${height}` } : undefined
  })
</script>

<template>
  <NuxtLink
    :to="banner.link"
    :target="banner.open_in_new ? '_blank' : undefined"
    class="block overflow-hidden rounded-2xl border border-surface"
    :style="aspectStyle"
  >
    <HikariImage
      :src="banner.image"
      :alt="banner.title ?? ''"
      :class="aspectStyle ? 'size-full' : 'w-full'"
      :image-class="aspectStyle ? 'size-full object-cover' : 'h-auto w-full'"
      :skeleton="false"
    />
  </NuxtLink>
</template>
