<script setup lang="ts">
  import { IconButton, ScrollArea } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { useScroll } from '@vueuse/core'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'HikariScrollRail' })

  const scroller = useTemplateRef<ComponentPublicInstance & { viewport?: HTMLElement }>('scroller')
  const viewport = computed(() => scroller.value?.viewport ?? null)
  const { arrivedState } = useScroll(viewport, { behavior: 'smooth' })

  function page(dir: 1 | -1) {
    const el = viewport.value
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' })
  }
</script>

<template>
  <div class="hikari-scroll-rail">
    <ScrollArea ref="scroller" :wheel-redirect="false" direction="horizontal">
      <slot />
    </ScrollArea>

    <div class="hikari-scroll-rail__arrow start" :class="{ 'is-visible': !arrivedState.left }">
      <IconButton pill variant="solid" label="向左滚动" :tooltip="false" @click="page(-1)">
        <ChevronLeft />
      </IconButton>
    </div>
    <div class="hikari-scroll-rail__arrow end" :class="{ 'is-visible': !arrivedState.right }">
      <IconButton pill variant="solid" label="向右滚动" :tooltip="false" @click="page(1)">
        <ChevronRight />
      </IconButton>
    </div>
  </div>
</template>

<style scoped>
  .hikari-scroll-rail {
    position: relative;
    min-width: 0;
  }
  .hikari-scroll-rail__arrow {
    display: none;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--hn-duration-base) var(--hn-ease-enter);
  }
  .hikari-scroll-rail__arrow.start {
    inset-inline-start: 0.75rem;
  }
  .hikari-scroll-rail__arrow.end {
    inset-inline-end: 0.75rem;
  }
  @media (hover: hover) {
    .hikari-scroll-rail__arrow {
      display: block;
    }
    .hikari-scroll-rail:hover .hikari-scroll-rail__arrow.is-visible {
      opacity: 1;
      pointer-events: auto;
    }
  }
</style>
