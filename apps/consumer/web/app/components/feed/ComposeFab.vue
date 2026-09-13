<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
  import { FileText, Image as ImageIcon, Plus } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { usePostComposerDialog } from './composer/composables/usePostComposerDialog'

  defineOptions({ name: 'FeedComposeFab' })

  const route = useRoute()
  const toolbar = useFloatingToolbar()
  const postComposer = usePostComposerDialog()
  const isDesktop = useBreakpoints(breakpointsTailwind).greaterOrEqual('md')

  const open = ref(false)
  const routePath = computed(() => route.path.replace(/\/+$/, '') || '/')
  const isFeedRoute = computed(
    () => routePath.value === '/' || /^\/(?:articles|posts)\/\d+$/.test(routePath.value),
  )
  const visible = computed(() => isFeedRoute.value && isDesktop.value)
  const iconClass = computed(() => (open.value ? 'rotate-45' : ''))
  const menuStyle = {
    right: 'max(1rem, calc((100vw - var(--page-container)) / 2 - 3.75rem))',
    bottom: 'max(8.75rem, calc(env(safe-area-inset-bottom) + 8.75rem))',
  }

  toolbar.add({
    id: 'feed-compose',
    label: '发布',
    icon: Plus,
    order: 20,
    visible,
    buttonClass:
      'rounded-full border-transparent bg-primary-500 text-white hover:border-transparent hover:bg-primary-600 hover:text-white dark:border-transparent dark:bg-primary-500 dark:hover:border-transparent dark:hover:bg-primary-600 dark:hover:text-white',
    iconClass,
    onClick: () => {
      open.value = !open.value
    },
  })

  watch(
    () => route.fullPath,
    () => {
      open.value = false
    },
  )

  watch(visible, shown => {
    if (!shown) open.value = false
  })
  onDeactivated(() => {
    open.value = false
  })

  function go(path: string) {
    open.value = false
    navigateTo(path)
  }
  function goPost() {
    open.value = false
    if (isDesktop.value) postComposer.show()
    else navigateTo('/posts/new')
  }
</script>

<template>
  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="open && visible"
        key="menu"
        class="fixed z-50 mr-(--p-scrollbar-width) flex w-max flex-col items-end gap-2.5"
        :style="menuStyle"
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 10 }"
        :transition="TRANSITION"
      >
        <Button
          unstyled
          login-required
          class="flex cursor-pointer items-center gap-2.5 rounded-full bg-surface-0 py-1.5 pr-1.5 pl-4 text-sm font-medium text-color shadow-lg dark:bg-surface-800"
          @click="go('/articles/new')"
        >
          写文章
          <span
            class="grid size-9 place-items-center rounded-full bg-surface-100 text-primary-600 dark:bg-surface-700"
          >
            <FileText :size="17" />
          </span>
        </Button>
        <Button
          unstyled
          login-required
          class="flex cursor-pointer items-center gap-2.5 rounded-full bg-surface-0 py-1.5 pr-1.5 pl-4 text-sm font-medium text-color shadow-lg dark:bg-surface-800"
          @click="goPost"
        >
          图文
          <span
            class="grid size-9 place-items-center rounded-full bg-surface-100 text-primary-600 dark:bg-surface-700"
          >
            <ImageIcon :size="17" />
          </span>
        </Button>
      </motion.div>
    </AnimatePresence>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && visible"
        class="fixed inset-0 z-30 bg-surface-950/15"
        @click="open = false"
      />
    </Transition>
  </Teleport>
</template>
