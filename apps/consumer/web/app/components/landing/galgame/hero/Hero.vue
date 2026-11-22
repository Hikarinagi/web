<script setup lang="ts">
  import { Flex, IconButton, Section, Stack, VisuallyHidden } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import emblaCarouselVue from 'embla-carousel-vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useAutoplay } from '~/features/landing/stage'
  import { cn } from '~/utils/cn'

  type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]

  defineOptions({ name: 'LandingGalgameHero' })
  const props = defineProps<{ items: Slide[]; today: string }>()

  const count = props.items.length
  const multi = count > 1
  const shift = multi ? count - 1 : 0
  const slides = props.items.map((_, index) => props.items[(index + shift) % count]!)
  const toPick = (slide: number) => (slide + shift) % count
  const toSlide = (pick: number) => (pick - shift + count) % count
  const opening = toSlide(0)
  const selected = ref(0)

  const [emblaRef, emblaApi] = emblaCarouselVue({
    loop: multi,
    align: 'center',
    startIndex: opening,
    watchDrag: multi,
  })
  function setViewport(el: Element | ComponentPublicInstance | null) {
    emblaRef.value = unrefElement(el as ComponentPublicInstance | null) as HTMLElement | undefined
  }
  watch(emblaApi, api => {
    if (!api) return
    const sync = () => (selected.value = toPick(api.selectedScrollSnap()))
    sync()
    api.on('select', sync).on('reInit', sync)
  })

  const hero = useTemplateRef<{ $el: HTMLElement }>('hero')
  const { running, paused } = useAutoplay(() => hero.value?.$el)

  function show(pick: number) {
    emblaApi.value?.scrollTo(toSlide(pick))
  }

  function pick(slide: number, event: MouseEvent) {
    if (toPick(slide) === selected.value) return
    event.preventDefault()
    event.stopPropagation()
    emblaApi.value?.scrollTo(slide)
  }

  const arrow = 'pointer-events-auto bg-surface/85 shadow-md backdrop-blur'
  const arrowShell =
    'pointer-events-none absolute inset-y-0 hidden opacity-0 transition-opacity duration-200 group-hover/hero:opacity-100 lg:flex'
</script>

<template>
  <Section
    ref="hero"
    aria-roledescription="carousel"
    class="group/hero relative pt-(--landing-stage-top) pb-10"
  >
    <VisuallyHidden as="h2">精选</VisuallyHidden>
    <Stack gap="none" class="relative">
      <Stack :ref="setViewport" gap="none" class="overflow-hidden">
        <Flex
          :style="{
            '--landing-hero-start': `calc((100% - var(--landing-banner-basis)) / 2 - ${opening} * var(--landing-banner-basis))`,
          }"
          :class="cn('touch-pan-y', !emblaApi && 'translate-x-(--landing-hero-start)')"
        >
          <Stack
            v-for="(item, index) in slides"
            :key="item.id"
            gap="none"
            :aria-hidden="toPick(index) !== selected || undefined"
            class="min-w-0 shrink-0 grow-0 basis-(--landing-banner-basis) px-[calc(var(--landing-banner-gap)/2)]"
            @click.capture="pick(index, $event)"
          >
            <LandingGalgameHeroSlide
              :item="item"
              :today="today"
              :active="toPick(index) === selected"
            />
          </Stack>
        </Flex>
      </Stack>
      <template v-if="multi">
        <Flex align="center" :class="cn(arrowShell, 'left-6')">
          <IconButton label="上一个" pill :class="arrow" @click="emblaApi?.scrollPrev()">
            <ChevronLeft />
          </IconButton>
        </Flex>
        <Flex align="center" :class="cn(arrowShell, 'right-6')">
          <IconButton label="下一个" pill :class="arrow" @click="emblaApi?.scrollNext()">
            <ChevronRight />
          </IconButton>
        </Flex>
      </template>
    </Stack>
    <Stack
      v-if="multi"
      gap="none"
      class="mx-auto w-(--landing-banner-basis) px-[calc(var(--landing-banner-gap)/2)] pt-5"
    >
      <LandingGalgameHeroTabs
        :items="items"
        :selected="selected"
        :cycling="running"
        :paused="paused"
        @select="show"
        @advance="emblaApi?.scrollNext()"
      />
    </Stack>
  </Section>
</template>
