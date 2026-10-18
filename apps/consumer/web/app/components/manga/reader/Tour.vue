<script setup lang="ts">
  import { Tour, type TourStep, type TourTarget } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import type { MangaReaderDirection, MangaReaderMode } from './lib/settings'
  import { mangaTourSteps, type MangaTourTarget } from './lib/tour'
  import { mangaTourPlay, type MangaTourDemo, type MangaTourEnv } from './lib/tour-plays'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'MangaReaderTour' })

  const props = defineProps<{
    open: boolean
    mode: MangaReaderMode
    direction: MangaReaderDirection
    tapSides: boolean
    zoomable: boolean
    narrow: boolean
    dark: boolean
    demo: MangaTourDemo
  }>()
  const emit = defineEmits<{ close: [] }>()

  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const step = ref(1)
  const outlined = ref<MangaTourTarget | null>(null)
  const left = useTemplateRef<HTMLElement>('left')
  const center = useTemplateRef<HTMLElement>('center')
  const right = useTemplateRef<HTMLElement>('right')
  const band = useTemplateRef<HTMLElement>('band')
  const rtl = computed(() => props.direction === 'rtl')

  const plan = computed(() =>
    mangaTourSteps({
      coarsePointer: coarsePointer.value,
      zoomable: props.zoomable,
      mode: props.mode,
      direction: props.direction,
      tapSides: props.tapSides,
      narrow: props.narrow,
    }),
  )

  const pageBox = () =>
    props.narrow ? (band.value?.getBoundingClientRect() ?? null) : props.demo.pageBox()

  const targets: Record<MangaTourTarget, TourTarget> = {
    next: () => (rtl.value ? left.value : right.value),
    previous: () => (rtl.value ? right.value : left.value),
    center: () => center.value,
    page: () => (props.narrow ? band.value : pageBox()),
    pager: () => props.demo.pagerBox(),
    pageNumber: '[data-tour="page-number"]',
    jump: '[role="dialog"]:has([data-tour="jump"])',
    settings: '[data-tour="settings"]',
    panel: '[role="dialog"]:has([data-tour="settings-panel"])',
    guide: '[data-tour="guide"]',
  }

  const env = computed<MangaTourEnv>(() => ({
    demo: props.demo,
    target: key => targets[key],
    page: pageBox,
    outline: key => (outlined.value = key),
    viewport: () => ({ width: window.innerWidth, height: window.innerHeight }),
    rtl: rtl.value,
    coarse: coarsePointer.value,
  }))

  const steps = computed<TourStep[]>(() =>
    plan.value.map(item => ({
      title: item.title,
      description: item.description,
      target: targets[item.target],
      side: item.side,
      align: item.align,
      padding: item.padding,
      scroll: false,
      wait: item.chrome ? 1500 : 0,
      play: mangaTourPlay(item, env.value),
    })),
  )

  const ringed = computed(() =>
    props.open ? (outlined.value ?? plan.value[step.value - 1]?.target ?? null) : null,
  )
  const rings = computed(() => {
    const key = ringed.value
    const side = (zone: 'left' | 'right') =>
      (key === 'next' && (zone === 'left') === rtl.value) ||
      (key === 'previous' && (zone === 'right') === rtl.value)
    return {
      left: side('left'),
      center: key === 'center',
      right: side('right'),
      band: props.narrow && key === 'page',
    }
  })
  const zone = computed(() =>
    cn(
      'row-start-1 rounded-lg border-2 border-transparent transition-colors',
      props.narrow ? 'h-3/5' : 'h-full',
    ),
  )

  async function beforeChange(next: number) {
    props.demo.chrome(plan.value[next - 1]?.chrome ?? false)
    await nextTick()
  }

  watch(
    () => props.open,
    open => {
      outlined.value = null
      props.demo.chrome(false)
      if (open) step.value = 1
    },
  )
</script>

<template>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-1 items-center gap-4 p-2"
    :class="narrow ? undefined : 'py-4'"
  >
    <div ref="left" :class="cn(zone, 'col-start-1', rings.left && 'border-accent')" />
    <div ref="center" :class="cn(zone, 'col-start-2', rings.center && 'border-accent')" />
    <div ref="right" :class="cn(zone, 'col-start-3', rings.right && 'border-accent')" />
    <div ref="band" :class="cn(zone, 'col-span-3 col-start-1', rings.band && 'border-accent')" />
  </div>
  <Tour
    v-model:step="step"
    :open="open"
    :steps="steps"
    mask="dim"
    block-page
    finish-text="开始阅读"
    :before-change="beforeChange"
    :class="dark ? 'dark' : undefined"
    @update:open="value => value || emit('close')"
  />
</template>
