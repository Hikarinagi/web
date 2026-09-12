<script setup lang="ts">
  import { Card, Center, Ripple, Stack } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'
  import { FileText, Image as ImageIcon, Plus } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { usePostComposerDialog } from './composer/composables/usePostComposerDialog'

  defineOptions({ name: 'FeedComposeFab' })

  const route = useRoute()
  const { requireLogin } = useAuthGate()
  const toolbar = useFloatingToolbar()
  const { elevated } = toolbar
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
    buttonClass: 'rounded-full border-transparent bg-accent text-accent-on',
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
  watch(open, value => {
    elevated.value = value
  })
  onDeactivated(() => {
    open.value = false
  })
  onBeforeUnmount(() => {
    elevated.value = false
  })

  function go(path: string) {
    open.value = false
    if (!requireLogin()) return
    navigateTo(path)
  }
  function goPost() {
    open.value = false
    if (!requireLogin()) return
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
        class="fixed z-70 hn-scrollbar-safe flex w-max flex-col items-end gap-2.5"
        :style="menuStyle"
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 10 }"
        :transition="TRANSITION"
      >
        <Card
          as="button"
          :padded="false"
          class="hn-state-layer flex hn-interactive items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-4 text-sm font-medium shadow-lg"
          @click="go('/articles/new')"
        >
          <Ripple />
          写文章
          <Center class="size-9 rounded-full bg-subtle text-accent-text">
            <FileText :size="17" />
          </Center>
        </Card>
        <Card
          as="button"
          :padded="false"
          class="hn-state-layer flex hn-interactive items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-4 text-sm font-medium shadow-lg"
          @click="goPost"
        >
          <Ripple />
          图文
          <Center class="size-9 rounded-full bg-subtle text-accent-text">
            <ImageIcon :size="17" />
          </Center>
        </Card>
      </motion.div>
    </AnimatePresence>

    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      leave-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <Stack
        v-if="open && visible"
        gap="none"
        class="hn-scrim fixed inset-0 z-59"
        @click="open = false"
      />
    </Transition>
  </Teleport>
</template>
