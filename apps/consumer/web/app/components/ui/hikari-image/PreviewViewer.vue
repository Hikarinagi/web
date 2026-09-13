<script setup lang="ts">
  import { motion, AnimatePresence } from 'motion-v'
  import SpinnerIcon from '@primevue/icons/spinner'
  import {
    HIKARI_PREVIEW_STRIP_DURATION_MS,
    computePreviewBaseSize,
    wrapIndex,
    type HikariImageBaseSize,
  } from './layout'
  import { useHikariImageGesture } from './composables/useGesture'
  import { useHikariImagePreview, type HikariImagePreviewItem } from './composables/usePreview'
  import { useHikariImageZoom } from './composables/useZoom'
  import { cn } from '#imports'

  defineOptions({ name: 'HikariImagePreviewViewer', inheritAttrs: false })

  const emit = defineEmits<{ backdrop: [] }>()

  const FLING_PROJECTION_MS = 220
  const NAV_COMMIT_THRESHOLD = 0.22
  const BADGE_DELAY_MS = 80

  const preview = useHikariImagePreview()
  const items = preview.items
  const currentIndex = preview.index
  const hasMultiple = preview.hasMultiple
  const isOpen = preview.isOpen

  const stageRef = ref<HTMLElement | null>(null)
  const wrapperRef = ref<HTMLElement | null>(null)
  const stripRef = ref<HTMLElement | null>(null)
  const zoom = useHikariImageZoom({ container: stageRef })

  const virtualIndex = ref(currentIndex.value)

  const mappedIndex = computed(() => wrapIndex(virtualIndex.value, items.value.length))
  const currentItem = computed(() => items.value[mappedIndex.value] ?? null)

  watch(isOpen, open => {
    if (open) virtualIndex.value = currentIndex.value
  })
  watch(currentIndex, next => {
    if (next !== mappedIndex.value) virtualIndex.value = next
  })
  watch(mappedIndex, mapped => {
    if (mapped !== currentIndex.value) preview.goTo(mapped)
  })

  function step(direction: -1 | 1) {
    if (!hasMultiple.value) return
    virtualIndex.value += direction
  }

  const originalLoaded = ref(false)
  const showBadge = ref(false)
  const stageWidth = ref(import.meta.client ? window.innerWidth : 0)
  const stageHeight = ref(import.meta.client ? window.innerHeight : 0)
  const dragBaseline = ref(0)
  let badgeTimer: ReturnType<typeof setTimeout> | null = null

  type Slot = {
    absIndex: number
    item: HikariImagePreviewItem
    isCurrent: boolean
  }

  const renderedSlots = computed<Slot[]>(() => {
    const list = items.value
    if (!list.length) return []
    const offsets = hasMultiple.value ? [-1, 0, 1] : [0]
    return offsets.map(offset => {
      const absIndex = virtualIndex.value + offset
      const item = list[wrapIndex(absIndex, list.length)]!
      return { absIndex, item, isCurrent: offset === 0 }
    })
  })

  function fitSizeFor(item: HikariImagePreviewItem): HikariImageBaseSize | null {
    if (!item.naturalWidth || !item.naturalHeight) return null
    return computePreviewBaseSize(
      item.naturalWidth / item.naturalHeight,
      stageWidth.value,
      stageHeight.value,
    )
  }

  function slotBoxStyle(slot: Slot) {
    const size = slot.isCurrent
      ? (zoom.baseSize.value ?? fitSizeFor(slot.item))
      : fitSizeFor(slot.item)
    const sizeStyle = size
      ? { width: `${size.width}px`, height: `${size.height}px` }
      : { maxWidth: '90vw', maxHeight: '86vh' }
    if (!slot.isCurrent) return sizeStyle
    return { ...zoom.transformStyle.value, ...sizeStyle }
  }

  const needsOriginal = computed(() => {
    const item = currentItem.value
    return Boolean(item && item.originalSrc !== item.displaySrc)
  })

  function isPointInsideImage(clientX: number, clientY: number) {
    const wrapper = wrapperRef.value
    if (!wrapper) return false
    const rect = wrapper.getBoundingClientRect()
    return (
      clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom
    )
  }

  function restingStripX() {
    return -virtualIndex.value * stageWidth.value
  }

  function readStripVisualX() {
    const el = stripRef.value
    if (!el) return restingStripX()
    const transform = getComputedStyle(el).transform
    if (!transform || transform === 'none') return restingStripX()
    try {
      return new DOMMatrixReadOnly(transform).m41
    } catch {
      return restingStripX()
    }
  }

  const gesture = useHikariImageGesture({
    stage: stageRef,
    scale: zoom.scale,
    isZoomed: zoom.isZoomed,
    canNavigate: () => hasMultiple.value,
    zoomAt: zoom.zoomAt,
    panBy: zoom.panBy,
    settle: zoom.settle,
    getTranslate: () => ({ tx: zoom.tx.value, ty: zoom.ty.value }),
    toggleDoubleClickZoom: zoom.toggleDoubleClickZoom,
    onNavigateStart: () => {
      dragBaseline.value = readStripVisualX() - restingStripX()
    },
    onNavigateEnd: info => {
      const totalOffset = dragBaseline.value + info.offset
      const projected = totalOffset + info.velocityPxPerMs * FLING_PROJECTION_MS
      const rawSteps = -projected / info.width
      dragBaseline.value = 0
      if (Math.abs(rawSteps) < NAV_COMMIT_THRESHOLD) return
      virtualIndex.value += Math.sign(rawSteps) * Math.max(1, Math.round(Math.abs(rawSteps)))
    },
    onTapOutside: () => emit('backdrop'),
    isPointInsideImage,
  })

  const dragOffset = computed(() => {
    const drag = gesture.navigationDrag.value
    if (!drag) return 0
    return dragBaseline.value + drag.offset
  })
  const stripStyle = computed(() => ({
    transform: `translate3d(${restingStripX() + dragOffset.value}px, 0, 0)`,
    transition:
      gesture.mode.value === 'navigate'
        ? 'none'
        : `transform ${HIKARI_PREVIEW_STRIP_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`,
    willChange: 'transform' as const,
  }))

  function handleCurrentImageLoad(event: Event, slot: Slot) {
    if (!slot.isCurrent) return
    const img = event.target as HTMLImageElement
    if (!img?.naturalWidth || !img?.naturalHeight) return
    zoom.fitToViewport(img.naturalWidth, img.naturalHeight)
  }

  function onOriginalLoad() {
    originalLoaded.value = true
    showBadge.value = false
    if (badgeTimer) {
      clearTimeout(badgeTimer)
      badgeTimer = null
    }
  }

  function resetBadge() {
    originalLoaded.value = false
    showBadge.value = false
    if (badgeTimer) clearTimeout(badgeTimer)
    badgeTimer = null
    if (!needsOriginal.value) return
    badgeTimer = setTimeout(() => {
      if (!originalLoaded.value) showBadge.value = true
      badgeTimer = null
    }, BADGE_DELAY_MS)
  }

  watch(
    () => currentItem.value?.id,
    id => {
      if (!id) return
      zoom.reset()
      const item = currentItem.value
      if (item?.naturalWidth && item?.naturalHeight) {
        zoom.fitToViewport(item.naturalWidth, item.naturalHeight)
      } else {
        zoom.clearBaseSize()
      }
      resetBadge()
    },
    { immediate: true },
  )

  defineExpose({
    navigate(direction: -1 | 1) {
      step(direction)
    },
  })

  function measureStage() {
    const el = stageRef.value
    stageWidth.value = el?.clientWidth ?? window.innerWidth
    stageHeight.value = el?.clientHeight ?? window.innerHeight
  }

  onMounted(() => {
    nextTick(measureStage)
    window.addEventListener('resize', measureStage)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('resize', measureStage)
    if (badgeTimer) clearTimeout(badgeTimer)
  })
</script>

<template>
  <div
    ref="stageRef"
    class="absolute inset-0 overflow-hidden select-none"
    v-bind="gesture.handlers"
  >
    <div ref="stripRef" class="absolute inset-y-0 left-0" :style="stripStyle">
      <div
        v-for="slot in renderedSlots"
        :key="slot.item.id"
        class="absolute inset-y-0 flex items-center justify-center"
        :style="{ left: `${slot.absIndex * stageWidth}px`, width: `${stageWidth}px` }"
      >
        <div
          :ref="
            el => {
              if (slot.isCurrent) wrapperRef = el as HTMLElement | null
            }
          "
          class="relative flex items-center justify-center will-change-transform"
          :style="slotBoxStyle(slot)"
        >
          <img
            :src="slot.item.displaySrc"
            :alt="slot.item.alt"
            class="block h-full w-full object-contain"
            draggable="false"
            @load="handleCurrentImageLoad($event, slot)"
          />
          <img
            v-if="slot.isCurrent && needsOriginal"
            :key="`${slot.item.id}-original`"
            :src="slot.item.originalSrc"
            :alt="slot.item.alt"
            :class="
              cn(
                'absolute inset-0 block h-full w-full object-contain transition-opacity duration-300 ease-out',
                originalLoaded ? 'opacity-100' : 'opacity-0',
              )
            "
            draggable="false"
            @load="onOriginalLoad"
          />

          <AnimatePresence>
            <motion.div
              v-if="slot.isCurrent && showBadge"
              key="badge"
              class="pointer-events-none absolute top-2 right-2 origin-top-right"
              :initial="{ opacity: 0, y: -4 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -4 }"
            >
              <span
                class="flex origin-top-right items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white backdrop-blur"
                :style="{ transform: `scale(${1 / zoom.scale.value})` }"
              >
                <SpinnerIcon class="size-3! animate-spin" />
                <span>加载原图</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
</template>
