<script setup lang="ts">
  import type { OverlayScrollbars } from 'overlayscrollbars'
  import { OverlayScrollbarsComponent } from 'overlayscrollbars-vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { computed, ref } from 'vue'
  import { useScrollShadow } from './scroll-area/composables/useScrollShadow'
  import { useWheelToHorizontal } from './scroll-area/composables/useWheelToHorizontal'

  type Axis = 'y' | 'x' | 'both'
  type Shadow = 'both' | 'start' | 'end' | 'none'
  type ScrollbarVisibility = 'visible' | 'hidden' | 'auto'

  const props = withDefaults(
    defineProps<{
      axis?: Axis
      shadow?: Shadow
      visibility?: ScrollbarVisibility
      wheelToHorizontal?: boolean
      arrows?: boolean
    }>(),
    {
      axis: 'y',
      shadow: 'both',
      visibility: 'auto',
      wheelToHorizontal: false,
      arrows: false,
    },
  )

  defineOptions({ name: 'HikariScrollArea' })

  const viewport = ref<HTMLElement | null>(null)
  const { showTop, showBottom, showLeft, showRight } = useScrollShadow(viewport)

  const hasY = computed(() => props.axis === 'y' || props.axis === 'both')
  const hasX = computed(() => props.axis === 'x' || props.axis === 'both')

  useWheelToHorizontal(viewport, () => props.wheelToHorizontal && hasX.value)

  // 悬停翻页箭头:仅在能 hover 的设备(鼠标/触控板,非触屏)出现;触屏用户直接横滑
  const canHover = useMediaQuery('(hover: hover)')
  const showArrows = computed(() => props.arrows && hasX.value && canHover.value)
  function page(dir: 1 | -1) {
    const el = viewport.value
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }

  const ARROW_BTN =
    'grid size-9 place-items-center rounded-full bg-white/90 text-surface-700 shadow-md transition hover:bg-white dark:bg-surface-800/90 dark:text-surface-200 dark:hover:bg-surface-700'
  const allowStart = computed(() => props.shadow === 'both' || props.shadow === 'start')
  const allowEnd = computed(() => props.shadow === 'both' || props.shadow === 'end')

  const osOptions = computed(() => ({
    scrollbars: {
      theme: 'os-theme-hikari',
      visibility: props.visibility,
      autoHide: 'leave' as const,
      autoHideDelay: 400,
    },
    overflow: {
      x: hasX.value ? ('scroll' as const) : ('hidden' as const),
      y: hasY.value ? ('scroll' as const) : ('hidden' as const),
    },
  }))

  function onInit(instance: OverlayScrollbars) {
    viewport.value = instance.elements().viewport as HTMLElement
  }

  defineExpose({ viewport })
</script>

<template>
  <div class="hikari-scroll-area">
    <OverlayScrollbarsComponent
      :options="osOptions"
      :events="{ initialized: onInit }"
      defer
      class="hikari-scroll-area__os"
    >
      <slot />
    </OverlayScrollbarsComponent>

    <div
      v-if="hasY && allowStart"
      class="hikari-scroll-area__shadow hikari-scroll-area__shadow--top"
      :class="{ 'is-visible': showTop }"
      aria-hidden="true"
    />
    <div
      v-if="hasY && allowEnd"
      class="hikari-scroll-area__shadow hikari-scroll-area__shadow--bottom"
      :class="{ 'is-visible': showBottom }"
      aria-hidden="true"
    />
    <div
      v-if="hasX && allowStart"
      class="hikari-scroll-area__shadow hikari-scroll-area__shadow--left"
      :class="{ 'is-visible': showLeft }"
      aria-hidden="true"
    />
    <div
      v-if="hasX && allowEnd"
      class="hikari-scroll-area__shadow hikari-scroll-area__shadow--right"
      :class="{ 'is-visible': showRight }"
      aria-hidden="true"
    />

    <template v-if="showArrows">
      <div
        class="hikari-scroll-area__arrow hikari-scroll-area__arrow--left"
        :class="{ 'is-visible': showLeft }"
      >
        <Button unstyled :class="ARROW_BTN" aria-label="向左滚动" @click="page(-1)">
          <ChevronLeft :size="20" />
        </Button>
      </div>
      <div
        class="hikari-scroll-area__arrow hikari-scroll-area__arrow--right"
        :class="{ 'is-visible': showRight }"
      >
        <Button unstyled :class="ARROW_BTN" aria-label="向右滚动" @click="page(1)">
          <ChevronRight :size="20" />
        </Button>
      </div>
    </template>
  </div>
</template>

<style scoped>
  .hikari-scroll-area {
    position: relative;
    min-height: 0;
    min-width: 0;
    overflow: hidden;
  }
  .hikari-scroll-area__os {
    width: 100%;
    height: 100%;
    /* 继承 root 的 max-height(若消费方用 max-h-* 给了 cap),支持「内容自适应到封顶后滚动」;
       fill 模式下 root 无 max-height → inherit 为 none,行为不变。 */
    max-height: inherit;
  }
  .hikari-scroll-area__shadow {
    position: absolute;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms ease-out;
    z-index: 1;
  }
  .hikari-scroll-area__shadow.is-visible {
    opacity: 1;
  }
  .hikari-scroll-area__arrow {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease-out;
  }
  .hikari-scroll-area:hover .hikari-scroll-area__arrow.is-visible {
    opacity: 1;
    pointer-events: auto;
  }
  .hikari-scroll-area__arrow--left {
    left: 0.75rem;
  }
  .hikari-scroll-area__arrow--right {
    right: 0.75rem;
  }
  .hikari-scroll-area__shadow--top,
  .hikari-scroll-area__shadow--bottom {
    left: 0;
    right: 0;
    height: 16px;
  }
  .hikari-scroll-area__shadow--top {
    top: 0;
    background: linear-gradient(
      to bottom,
      color-mix(in oklab, var(--p-surface-950) 14%, transparent),
      transparent
    );
  }
  .hikari-scroll-area__shadow--bottom {
    bottom: 0;
    background: linear-gradient(
      to top,
      color-mix(in oklab, var(--p-surface-950) 14%, transparent),
      transparent
    );
  }
  .hikari-scroll-area__shadow--left,
  .hikari-scroll-area__shadow--right {
    top: 0;
    bottom: 0;
    width: 16px;
  }
  .hikari-scroll-area__shadow--left {
    left: 0;
    background: linear-gradient(
      to right,
      color-mix(in oklab, var(--p-surface-950) 14%, transparent),
      transparent
    );
  }
  .hikari-scroll-area__shadow--right {
    right: 0;
    background: linear-gradient(
      to left,
      color-mix(in oklab, var(--p-surface-950) 14%, transparent),
      transparent
    );
  }
</style>
