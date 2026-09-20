<script setup lang="ts">
  import { Check } from '@lucide/vue'
  import { flip, offset, shift, useFloating, type Placement } from '@floating-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { Component } from 'vue'
  import { TRANSITION_FAST } from '~/lib/motion'

  defineOptions({ name: 'HikariEditorMenuFloating' })

  export interface EditorMenuItem {
    id: string
    icon: Component
    label: string
    danger?: boolean
    checked?: boolean
  }

  export interface EditorMenuGroup {
    label?: string
    items: EditorMenuItem[]
  }

  const props = withDefaults(
    defineProps<{
      open: boolean
      anchor: HTMLElement | null
      groups: EditorMenuGroup[]
      placement?: Placement
    }>(),
    { placement: 'left' },
  )

  const emit = defineEmits<{ select: [id: string]; close: [] }>()

  const SCROLL_KEYS = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '])

  const FALLBACKS: Record<string, Placement[]> = {
    left: ['right'],
    right: ['left'],
    top: ['bottom'],
    bottom: ['top'],
  }

  const side = computed(() => props.placement.split('-')[0] ?? 'left')

  const ORIGINS: Record<string, string> = {
    left: 'right center',
    right: 'left center',
    top: 'center bottom',
    bottom: 'center top',
  }

  const OFFSETS: Record<string, { x?: number; y?: number }> = {
    left: { x: 4 },
    right: { x: -4 },
    top: { y: 4 },
    bottom: { y: -4 },
  }

  const hidden = computed(() => ({ opacity: 0, scale: 0.96, x: 0, y: 0, ...OFFSETS[side.value] }))

  const anchorRef = computed(() => props.anchor)
  const panelRef = useTemplateRef<HTMLElement>('panelRef')

  const { floatingStyles, update } = useFloating(anchorRef, panelRef, {
    placement: computed(() => props.placement),
    strategy: 'fixed',
    middleware: [
      offset(8),
      flip({ fallbackPlacements: FALLBACKS[props.placement.split('-')[0] ?? 'left'] }),
      shift({ padding: 12 }),
    ],
  })

  const anchored = ref<Record<string, string>>({})
  watchEffect(() => {
    if (props.open) anchored.value = { ...floatingStyles.value }
  })

  watch(
    () => props.open,
    async open => {
      if (!open) return
      await nextTick()
      update()
    },
  )

  const scrollRef = useTemplateRef<{ viewport: HTMLElement | null }>('scrollRef')

  function onWheel(event: WheelEvent) {
    const el = scrollRef.value?.viewport
    if (!el) {
      event.preventDefault()
      return
    }
    const atTop = el.scrollTop <= 0
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1
    if (event.deltaY < 0 ? atTop : atBottom) event.preventDefault()
  }

  useEventListener(window, 'keydown', (event: KeyboardEvent) => {
    if (!props.open) return
    if (event.key === 'Escape') {
      event.preventDefault()
      emit('close')
      return
    }
    if (SCROLL_KEYS.has(event.key)) event.preventDefault()
  })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="hikari-editor-menu__mask"
      @pointerdown.prevent="emit('close')"
      @wheel.prevent
      @touchmove.prevent
      @contextmenu.prevent
    />
    <div ref="panelRef" class="hikari-editor-menu-host" :style="anchored">
      <AnimatePresence>
        <motion.div
          v-if="open"
          class="hikari-editor-menu"
          :style="{ transformOrigin: ORIGINS[side] }"
          :initial="hidden"
          :animate="{ opacity: 1, scale: 1, x: 0, y: 0 }"
          :exit="hidden"
          :transition="TRANSITION_FAST"
          @wheel="onWheel"
        >
          <ScrollArea ref="scrollRef" axis="y" shadow="both" class="hikari-editor-menu__scroll">
            <div v-for="(group, index) in groups" :key="index" class="hikari-editor-menu__group">
              <div v-if="index > 0" class="hikari-editor-menu__divider" />
              <p v-if="group.label" class="hikari-editor-menu__label">{{ group.label }}</p>
              <Button
                v-for="item in group.items"
                :key="item.id"
                unstyled
                type="button"
                :class="[
                  'hikari-editor-menu__item',
                  { 'is-danger': item.danger, 'is-checked': item.checked },
                ]"
                @mousedown.prevent
                @click="emit('select', item.id)"
              >
                <component :is="item.icon" :size="15" />
                <span>{{ item.label }}</span>
                <Check v-if="item.checked" class="hikari-editor-menu__check" :size="14" />
              </Button>
            </div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>
    </div>
  </Teleport>
</template>

<style scoped>
  .hikari-editor-menu__mask {
    position: fixed;
    inset: 0;
    z-index: 10570;
    touch-action: none;
    overscroll-behavior: contain;
  }

  .hikari-editor-menu-host {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 10580;
    pointer-events: none;
  }

  .hikari-editor-menu {
    display: flex;
    pointer-events: auto;
    flex-direction: column;
    min-width: 200px;
    max-height: calc(100dvh - 24px);
    padding: 6px;
    background: var(--editor-popover-bg);
    border: 1px solid var(--editor-popover-border);
    border-radius: var(--editor-panel-radius);
    box-shadow: var(--editor-popover-shadow);
  }
  .hikari-editor-menu__scroll {
    min-height: 0;
  }
  .hikari-editor-menu__group {
    display: flex;
    flex-direction: column;
  }
  .hikari-editor-menu__divider {
    height: 1px;
    margin: 6px 0;
    background: var(--editor-popover-border);
  }
  .hikari-editor-menu__label {
    padding: 4px 10px 6px;
    color: var(--editor-text-muted);
    font-size: 12px;
    line-height: 1.2;
  }
  .hikari-editor-menu__item {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-radius: var(--editor-chip-radius);
    background: transparent;
    color: var(--editor-text-color);
    font-size: 14px;
    text-align: left;
    cursor: pointer;
    transition:
      background 120ms ease-out,
      color 120ms ease-out;
  }
  .hikari-editor-menu__item:hover {
    background: var(--editor-toolbar-item-hover);
  }
  .hikari-editor-menu__item.is-danger {
    color: var(--p-red-500);
  }
  .hikari-editor-menu__item.is-danger:hover {
    background: color-mix(in srgb, var(--p-red-500) 12%, transparent);
  }
  .hikari-editor-menu__item.is-checked {
    color: var(--editor-toolbar-item-active);
  }
  .hikari-editor-menu__check {
    margin-left: auto;
  }
</style>
