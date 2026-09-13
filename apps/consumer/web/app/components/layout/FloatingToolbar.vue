<script setup lang="ts">
  import { ArrowLeft, ChevronUp } from '@lucide/vue'
  import { AnimatePresence, LayoutGroup, motion } from 'motion-v'
  import type { Component } from 'vue'
  import { TRANSITION, TRANSITION_FAST } from '~/lib/motion'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LayoutFloatingToolbar' })

  interface ToolbarItem {
    id: string
    label: string
    icon: Component
    order: number
    visible: boolean
    disabled?: boolean
    buttonClass?: string
    iconClass?: string
    onClick: () => void | Promise<void>
  }

  const HOME_PATHS = new Set(['/', '/galgames', '/light-novels'])
  const SCROLL_THRESHOLD = 280
  const BUTTON_CLASS =
    'pointer-events-auto grid size-10 cursor-pointer place-items-center rounded-lg border border-surface-200/75 bg-surface-0/90 text-muted-color shadow-[0_8px_24px_rgba(15,23,42,0.12)] backdrop-blur transition-colors hover:border-surface-300 hover:bg-surface-0 hover:text-color disabled:cursor-not-allowed disabled:opacity-45 dark:border-surface-700/75 dark:bg-surface-900/90 dark:hover:border-surface-600 dark:hover:bg-surface-900'
  const ICON_CLASS = 'size-4.5 transition-transform duration-200 ease-out'
  const ITEM_TRANSITION = {
    ...TRANSITION_FAST,
    layout: TRANSITION,
  }

  const route = useRoute()
  const router = useRouter()
  const { y } = useWindowScroll()
  const { actions, topHandlers, activeTop } = useFloatingToolbar()

  const routePath = computed(() => route.path.replace(/\/+$/, '') || '/')
  const showBack = computed(() => !HOME_PATHS.has(routePath.value))
  const showTop = computed(() => y.value > SCROLL_THRESHOLD)
  const suppressed = computed(() => route.meta.floatingToolbar === false)
  const toolbarStyle = {
    right: 'max(1rem, calc((100vw - var(--page-container)) / 2 - 3.75rem))',
    bottom: 'max(5.5rem, calc(env(safe-area-inset-bottom) + 5.5rem))',
  }

  const defaultItems = computed<ToolbarItem[]>(() => [
    {
      id: 'scroll-top',
      label: activeTop.value?.label ?? '回到顶部',
      icon: activeTop.value?.icon ?? ChevronUp,
      order: 0,
      visible: showTop.value,
      onClick: scrollTop,
    },
    {
      id: 'back',
      label: '返回',
      icon: ArrowLeft,
      order: 10,
      visible: showBack.value,
      onClick: back,
    },
  ])
  const customItems = computed<ToolbarItem[]>(() =>
    actions.value.map(item => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      order: item.order ?? 100,
      visible: item.visible === undefined ? true : Boolean(toValue(item.visible)),
      disabled: item.disabled === undefined ? false : Boolean(toValue(item.disabled)),
      buttonClass: item.buttonClass === undefined ? undefined : toValue(item.buttonClass),
      iconClass: item.iconClass === undefined ? undefined : toValue(item.iconClass),
      onClick: item.onClick,
    })),
  )
  const items = computed(() =>
    [...defaultItems.value, ...customItems.value].sort((a, b) => a.order - b.order),
  )
  const visibleItems = computed(() => items.value.filter(item => item.visible))

  function back() {
    if (!import.meta.client) return

    if (window.history.state?.back) router.back()
    else void navigateTo('/')
  }

  function click(item: ToolbarItem) {
    if (item.disabled) return

    void item.onClick()
  }

  function buttonClass(item: ToolbarItem) {
    return cn(BUTTON_CLASS, item.buttonClass)
  }

  function iconClass(item: ToolbarItem) {
    return cn(ICON_CLASS, item.iconClass)
  }

  const iconKeys = new WeakMap<object, number>()
  let iconKeySeq = 0
  function iconKey(item: ToolbarItem) {
    const icon = item.icon as unknown as object
    let key = iconKeys.get(icon)
    if (key === undefined) {
      key = ++iconKeySeq
      iconKeys.set(icon, key)
    }
    return `${item.id}:${key}`
  }

  function scrollTop() {
    if (!import.meta.client) return

    const handler = topHandlers.value.at(-1)
    if (handler) {
      void handler()
      return
    }

    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
</script>

<template>
  <Teleport to="body">
    <motion.aside
      v-if="!suppressed"
      class="pointer-events-none fixed z-40 mr-(--p-scrollbar-width) flex h-48 w-10 flex-col justify-end gap-2"
      :style="toolbarStyle"
      :initial="{ opacity: 1 }"
      :animate="{ opacity: 1 }"
      :transition="TRANSITION"
      aria-label="页面工具栏"
    >
      <LayoutGroup id="floating-toolbar">
        <AnimatePresence :initial="false" mode="popLayout">
          <motion.div
            v-for="item in visibleItems"
            :key="item.id"
            v-tooltip.left="item.label"
            :layout="'position'"
            class="size-10"
            :initial="{ opacity: 0, scale: 0.92 }"
            :animate="{ opacity: 1, scale: 1 }"
            :exit="{ opacity: 0, scale: 0.92 }"
            :transition="ITEM_TRANSITION"
          >
            <Button
              unstyled
              :aria-label="item.label"
              :disabled="item.disabled"
              :class="buttonClass(item)"
              @click="click(item)"
            >
              <AnimatePresence mode="wait" :initial="false">
                <motion.span
                  :key="iconKey(item)"
                  class="grid size-full place-items-center"
                  :initial="{ opacity: 0, rotate: -90, scale: 0.5 }"
                  :animate="{ opacity: 1, rotate: 0, scale: 1 }"
                  :exit="{ opacity: 0, rotate: 90, scale: 0.5 }"
                  :transition="TRANSITION_FAST"
                >
                  <component :is="item.icon" :class="iconClass(item)" aria-hidden="true" />
                </motion.span>
              </AnimatePresence>
            </Button>
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </motion.aside>
  </Teleport>
</template>
