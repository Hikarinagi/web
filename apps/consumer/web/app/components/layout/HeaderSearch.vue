<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { breakpointsTailwind } from '@vueuse/core'
  import { blockBodyScroll, unblockBodyScroll } from 'primevue/utils'
  import { Search } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { useSearch } from '~/features/search/composables/useSearch'
  import { useSearchControls } from '~/features/search/composables/useSearchControls'
  import { useSearchOverlay } from '~/features/search/composables/useSearchOverlay'
  import { SEARCH_LISTBOX_ID, searchOptionId } from '~/features/search/search'

  defineOptions({ name: 'LayoutHeaderSearch' })

  const search = useSearch()
  const { open, show, close } = useSearchOverlay()
  const { onKeydown, onPick } = useSearchControls(search)
  const isMobile = useBreakpoints(breakpointsTailwind).smaller('md')

  const triggerRef = useTemplateRef<HTMLElement>('triggerRef')
  const inputRef = useTemplateRef<{ $el: HTMLInputElement }>('inputRef')

  const { top, right } = useElementBounding(triggerRef)
  const { width: winW } = useWindowSize()

  const barWidth = computed(() => Math.min(544, Math.max(280, winW.value - 120)))
  const overlayStyle = computed(() => ({
    top: `${top.value}px`,
    right: `${Math.max(0, winW.value - right.value)}px`,
    width: `${barWidth.value}px`,
  }))

  watch(open, opened => {
    if (opened) {
      void search.loadTrending()
      if (!isMobile.value) nextTick(() => inputRef.value?.$el?.focus())
    } else {
      search.reset()
    }
  })

  watchEffect(onCleanup => {
    if (!import.meta.client || !open.value) return
    blockBodyScroll()
    onCleanup(unblockBodyScroll)
  })

  onKeyStroke('Escape', () => {
    if (open.value) close()
  })
</script>

<template>
  <div ref="triggerRef" class="size-10">
    <Button aria-label="搜索" rounded severity="secondary" variant="text" @click="show">
      <template #icon><Search class="text-color" /></template>
    </Button>
  </div>

  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open && !isMobile"
        key="scrim"
        class="fixed inset-0 z-59 bg-surface-950/20"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
        :transition="TRANSITION"
        @click="close"
      />
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="open && !isMobile"
        key="search"
        class="fixed z-60 mr-(--p-scrollbar-width)"
        :style="overlayStyle"
        :initial="{ opacity: 0, y: -6 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: -6 }"
        :transition="TRANSITION"
      >
        <div
          class="flex h-10 items-center gap-2.5 rounded-lg border border-primary-400 bg-surface-0 px-3.5 shadow-lg ring-2 ring-primary-500/15 dark:bg-surface-900"
        >
          <Search class="size-[18px] shrink-0 text-primary" />
          <InputText
            ref="inputRef"
            v-model="search.query"
            unstyled
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            :aria-controls="SEARCH_LISTBOX_ID"
            :aria-activedescendant="
              search.activeIndex >= 0 ? searchOptionId(search.activeIndex) : undefined
            "
            placeholder="搜索作品 / 角色 / 人物…"
            class="min-w-0 flex-1 bg-transparent text-sm text-color outline-none placeholder:text-muted-color"
            @keydown="onKeydown"
          />
        </div>

        <div class="mt-2">
          <SearchPanel :search="search" @pick="onPick" />
        </div>
      </motion.div>
    </AnimatePresence>
  </Teleport>

  <SearchMobile :search="search" :open="open && isMobile" @close="close" />
</template>
