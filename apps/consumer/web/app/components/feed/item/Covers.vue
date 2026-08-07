<script setup lang="ts">
  import { Expand } from '@lucide/vue'
  import type { FeedItemByType } from '~/features/feed/feed'

  defineOptions({ name: 'FeedItemCovers' })

  const props = defineProps<{
    covers: FeedItemByType<'post'>['covers']
    total: number
  }>()

  const PORTRAIT_CAP = 9 / 16
  const FALLBACK_ASPECT = 4 / 3
  const CELL = { width: 900, height: 900, quality: 82, fit: 'scale-down' as const }

  const extra = computed(() => props.total - props.covers.length)

  const single = computed(() => {
    const cover = props.covers[0]
    const natural = cover?.width && cover.height ? cover.width / cover.height : null
    if (!natural) return { aspect: FALLBACK_ASPECT, cropped: false, imageClass: 'object-contain' }
    if (natural < PORTRAIT_CAP) {
      return { aspect: PORTRAIT_CAP, cropped: true, imageClass: 'object-cover' }
    }
    return { aspect: natural, cropped: false, imageClass: 'object-cover' }
  })
</script>

<template>
  <HikariImageGroup
    v-if="covers.length === 1"
    class="relative z-1 overflow-hidden rounded-xl border border-surface"
  >
    <HikariImage
      :src="covers[0]!.src"
      alt=""
      class="w-full"
      :style="{ aspectRatio: single.aspect }"
      :image-class="`size-full ${single.imageClass}`"
      :processing="{ width: 800, quality: 85, fit: 'scale-down' }"
      preview
    />
    <span
      v-if="single.cropped"
      class="pointer-events-none absolute top-2 right-2 rounded-full bg-black/45 p-1.5"
    >
      <Expand class="size-3.5 text-white" />
    </span>
  </HikariImageGroup>

  <HikariImageGroup
    v-else-if="covers.length === 2"
    class="relative z-1 grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-surface"
  >
    <HikariImage
      v-for="cover in covers"
      :key="cover.id"
      :src="cover.src"
      alt=""
      class="aspect-square"
      image-class="size-full object-cover"
      :processing="CELL"
      preview
    />
  </HikariImageGroup>

  <HikariImageGroup
    v-else-if="covers.length === 3"
    class="relative z-1 grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-surface"
  >
    <HikariImage
      :src="covers[0]!.src"
      alt=""
      class="aspect-square"
      image-class="size-full object-cover"
      :processing="CELL"
      preview
    />
    <div class="grid aspect-square grid-rows-2 gap-1">
      <HikariImage
        v-for="cover in covers.slice(1)"
        :key="cover.id"
        :src="cover.src"
        alt=""
        class="size-full"
        image-class="size-full object-cover"
        :processing="CELL"
        preview
      />
    </div>
  </HikariImageGroup>

  <HikariImageGroup
    v-else-if="covers.length"
    class="relative z-1 grid grid-cols-2 gap-1 overflow-hidden rounded-xl border border-surface"
  >
    <div v-for="(cover, index) in covers" :key="cover.id" class="relative">
      <HikariImage
        :src="cover.src"
        alt=""
        class="aspect-3/2"
        image-class="size-full object-cover"
        :processing="CELL"
        preview
      />
      <span
        v-if="index === covers.length - 1 && extra > 0"
        class="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white"
      >
        +{{ extra }}
      </span>
    </div>
  </HikariImageGroup>
</template>
