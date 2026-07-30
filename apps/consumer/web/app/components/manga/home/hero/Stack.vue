<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { EASE } from '~/lib/motion'
  import { titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeHeroStack' })
  const props = defineProps<{
    slides: MangaHomePageData['hero']['slides']
    current: number
  }>()
  const emit = defineEmits<{ select: [index: number] }>()

  const poses = [
    { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 },
    { x: 99, y: -3.5, rotate: -4, scale: 0.943, opacity: 0.85 },
    { x: -91.5, y: 8.5, rotate: 3.5, scale: 0.898, opacity: 0.8 },
  ]
  const hiddenPose = { x: 0, y: 12, rotate: 0, scale: 0.86, opacity: 0 }

  function offsetOf(index: number) {
    return (index - props.current + props.slides.length) % props.slides.length
  }

  function poseOf(index: number) {
    return poses[offsetOf(index)] ?? hiddenPose
  }

  function zOf(index: number) {
    const offset = offsetOf(index)
    return offset < poses.length ? poses.length - offset : 0
  }
</script>

<template>
  <div class="h-82.5 w-96.5 pt-2.25 pl-21.5">
    <div class="grid h-75 w-50">
      <motion.div
        v-for="(slide, index) in slides"
        :key="slide.manga.id"
        class="col-start-1 row-start-1"
        :style="{
          zIndex: zOf(index),
          pointerEvents: offsetOf(index) < poses.length ? 'auto' : 'none',
        }"
        :initial="false"
        :animate="poseOf(index)"
        :transition="{ duration: 0.45, ease: EASE }"
      >
        <NuxtLink
          v-if="index === current"
          :to="`/mangas/${slide.manga.id}`"
          class="block aspect-2/3 w-full overflow-hidden rounded-lg shadow-[0px_10px_28px_0px_rgba(13,26,31,0.22)]"
        >
          <HikariImage
            :src="topVotedMedia(slide.manga.covers)"
            :alt="titleOf(slide.manga)"
            class="size-full"
            image-class="size-full object-cover object-top"
            preset="medium"
          />
        </NuxtLink>
        <Button
          v-else
          unstyled
          class="block aspect-2/3 w-full cursor-pointer overflow-hidden rounded-lg shadow-[0px_10px_28px_0px_rgba(13,26,31,0.22)]"
          :aria-label="`切换到 ${titleOf(slide.manga)}`"
          :tabindex="offsetOf(index) < poses.length ? undefined : -1"
          @click="emit('select', index)"
        >
          <HikariImage
            :src="topVotedMedia(slide.manga.covers)"
            alt=""
            class="size-full"
            image-class="size-full object-cover object-top"
            preset="medium"
          />
        </Button>
      </motion.div>
    </div>
  </div>
</template>
