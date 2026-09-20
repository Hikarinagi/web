<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { EASE } from '~/lib/motion'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeHeroBand' })
  const props = defineProps<{
    slides: MangaHomePageData['hero']['slides']
  }>()

  const backdropProcessing = {
    width: 1600,
    height: 480,
    fit: 'cover',
    quality: 60,
    blur: 40,
  } as const

  const sectionRef = ref<HTMLElement | null>(null)
  const current = ref(0)
  const cycle = ref(0)
  const hovered = useElementHover(sectionRef)
  const { focused } = useFocusWithin(sectionRef)
  const reducedMotion = usePreferredReducedMotion()

  const active = computed(() => props.slides[current.value])
  const rotatable = computed(() => props.slides.length > 1)
  const autoplay = computed(() => rotatable.value && reducedMotion.value !== 'reduce')
  const running = computed(() => autoplay.value && !hovered.value && !focused.value)

  function show(index: number) {
    current.value = (index + props.slides.length) % props.slides.length
  }

  function select(index: number) {
    cycle.value += 1
    show(index)
  }
</script>

<template>
  <section
    ref="sectionRef"
    role="region"
    aria-roledescription="carousel"
    aria-label="漫画精选"
    class="relative isolate overflow-hidden border-b border-surface"
    :class="
      slides.length
        ? 'min-h-[calc(21rem+var(--app-header-height))]'
        : 'min-h-[calc(200px+var(--app-header-height))]'
    "
  >
    <template v-if="slides.length">
      <div class="absolute inset-0 -z-20">
        <motion.div
          v-for="(slide, index) in slides"
          :key="slide.manga.id"
          class="absolute inset-0"
          :initial="false"
          :animate="{ opacity: index === current ? 1 : 0 }"
          :transition="{ duration: 0.5, ease: EASE }"
        >
          <HikariImage
            :src="topVotedMedia(slide.manga.covers)"
            alt=""
            class="size-full"
            image-class="object-cover"
            :processing="backdropProcessing"
            :skeleton="false"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
        </motion.div>
      </div>
      <div
        class="absolute inset-0 -z-10 bg-linear-to-r from-surface-0/95 via-surface-0/85 to-surface-0/40 dark:from-surface-950/92 dark:via-surface-950/80 dark:to-surface-950/40"
      />
    </template>
    <div
      v-else
      class="absolute inset-0 -z-10 bg-linear-to-r from-surface-0 via-surface-0 to-surface-100 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900"
    />

    <div class="mx-auto box-content max-w-app px-6 pt-(--app-header-height)">
      <h1 class="sr-only">漫画</h1>
      <div v-if="slides.length" class="flex h-88 items-start justify-between gap-8">
        <div class="flex min-w-0 flex-col items-start pt-12">
          <div class="grid h-57 w-140 max-w-full">
            <AnimatePresence :initial="false">
              <motion.div
                v-if="active"
                :key="active.manga.id"
                class="col-start-1 row-start-1 min-w-0"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.5, ease: EASE }"
              >
                <MangaHomeHeroSlide :slide="active" />
              </motion.div>
            </AnimatePresence>
          </div>
          <MangaHomeHeroStrips
            v-if="rotatable"
            class="mt-2.5"
            :count="slides.length"
            :current="current"
            :cycle="cycle"
            :animated="autoplay"
            :running="running"
            @select="select"
            @elapsed="show(current + 1)"
          />
        </div>
        <MangaHomeHeroStack
          class="mt-0.75 hidden shrink-0 lg:block"
          :slides="slides"
          :current="current"
          @select="select"
        />
      </div>
    </div>
  </section>
</template>
