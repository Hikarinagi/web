<script setup lang="ts">
  import { Flex, Grid, Heading, Inline, Stack } from '@hina-ui/vue'
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

  const sectionRef = useTemplateRef('sectionRef')
  const sectionEl = computed(() => unrefElement(sectionRef))
  const current = ref(0)
  const cycle = ref(0)
  const hovered = useElementHover(sectionEl)
  const { focused } = useFocusWithin(sectionEl)
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
  <Stack
    ref="sectionRef"
    as="section"
    gap="none"
    role="region"
    aria-roledescription="carousel"
    aria-label="漫画精选"
    class="relative isolate overflow-hidden border-b border-line"
    :class="
      slides.length
        ? 'min-h-[calc(21rem+var(--app-header-height))]'
        : 'min-h-[calc(200px+var(--app-header-height))]'
    "
  >
    <template v-if="slides.length">
      <Flex class="absolute inset-0 -z-20">
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
            <template #empty />
            <template #error />
          </HikariImage>
        </motion.div>
      </Flex>
      <Stack
        gap="none"
        class="absolute inset-0 -z-10 bg-linear-to-r from-surface/95 via-surface/85 to-surface/40"
        aria-hidden="true"
      />
    </template>
    <Stack
      v-else
      gap="none"
      class="absolute inset-0 -z-10 bg-linear-to-r from-surface via-surface to-subtle"
      aria-hidden="true"
    />

    <Stack gap="none" class="px-6 pt-(--app-header-height)">
      <Stack gap="none" class="mx-auto w-full max-w-app">
        <Heading :level="1" class="sr-only">漫画</Heading>
        <Inline
          v-if="slides.length"
          align="start"
          justify="between"
          :wrap="false"
          gap="none"
          class="h-88 gap-8"
        >
          <Stack align="start" gap="none" class="min-w-0 pt-12">
            <Grid :cols="1" class="h-57 w-140 max-w-full">
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
            </Grid>
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
          </Stack>
          <MangaHomeHeroStack
            class="mt-0.75 hidden shrink-0 lg:block"
            :slides="slides"
            :current="current"
            @select="select"
          />
        </Inline>
      </Stack>
    </Stack>
  </Stack>
</template>
