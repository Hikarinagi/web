<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import {
    BookImage,
    BookOpen,
    FileText,
    GamepadDirectional,
    Image as ImageIcon,
    MessagesSquare,
    Plus,
    Smartphone,
  } from '@lucide/vue'
  import type { HeaderNavIcon, HeaderNavItem } from '~/config/site'
  import { TRANSITION } from '~/lib/motion'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LayoutBottomBar' })

  const route = useRoute()

  const composeOpen = ref(false)
  const composeMenuStyle = {
    bottom: 'calc(var(--app-bottombar-height) + env(safe-area-inset-bottom) + 0.75rem)',
  }
  watch(
    () => route.fullPath,
    () => {
      composeOpen.value = false
    },
  )

  const navIconMap = {
    gamepad: GamepadDirectional,
    bookOpen: BookOpen,
    bookImage: BookImage,
    messagesSquare: MessagesSquare,
    smartphone: Smartphone,
  } satisfies Record<HeaderNavIcon, Component>

  const navItems = useHeaderNav()
  const barItems = computed(() => navItems.value.filter(item => !item.desktopOnly))
  const leadingItems = computed(() => barItems.value.slice(0, 2))
  const trailingItems = computed(() => barItems.value.slice(2))

  function isActive(item: HeaderNavItem) {
    if (item.match === 'exact') return route.path === item.to
    return route.path === item.to || route.path.startsWith(`${item.to}/`)
  }

  function tabClass(active: boolean) {
    return cn(
      'flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors duration-200',
      'focus-visible:outline-none',
      active ? 'text-primary' : 'text-muted-color',
    )
  }

  function onPlus() {
    composeOpen.value = !composeOpen.value
  }

  function go(path: string) {
    composeOpen.value = false
    navigateTo(path)
  }
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-50 border-t border-surface bg-surface-0/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-[1.8] md:hidden dark:bg-surface-950/85"
    aria-label="移动端主导航"
  >
    <div class="mx-auto flex h-(--app-bottombar-height) max-w-md items-stretch px-1">
      <div class="flex flex-1 items-stretch">
        <NuxtLink
          v-for="item in leadingItems"
          :key="item.to"
          :to="item.to"
          :class="tabClass(isActive(item))"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <component :is="navIconMap[item.icon]" class="size-5.5" aria-hidden="true" />
          <span class="leading-none">{{ item.label }}</span>
        </NuxtLink>
      </div>

      <div class="flex shrink-0 items-center justify-center px-3">
        <Button
          rounded
          login-required
          aria-label="发布"
          aria-haspopup="menu"
          :aria-expanded="composeOpen"
          class="size-11!"
          @click="onPlus"
        >
          <template #icon>
            <Plus
              :size="26"
              :stroke-width="2.75"
              class="transition-transform duration-200"
              :class="{ 'rotate-45': composeOpen }"
              aria-hidden="true"
            />
          </template>
        </Button>
      </div>

      <div class="flex flex-1 items-stretch">
        <NuxtLink
          v-for="item in trailingItems"
          :key="item.to"
          :to="item.to"
          :class="tabClass(isActive(item))"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <component :is="navIconMap[item.icon]" class="size-5.5" aria-hidden="true" />
          <span class="leading-none">{{ item.label }}</span>
        </NuxtLink>
      </div>
    </div>
  </nav>

  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="composeOpen"
        key="compose-menu"
        role="menu"
        class="fixed left-1/2 z-50 flex w-max -translate-x-1/2 flex-col items-center gap-2.5 md:hidden"
        :style="composeMenuStyle"
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 10 }"
        :transition="TRANSITION"
      >
        <Button
          unstyled
          role="menuitem"
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
          role="menuitem"
          class="flex cursor-pointer items-center gap-2.5 rounded-full bg-surface-0 py-1.5 pr-1.5 pl-4 text-sm font-medium text-color shadow-lg dark:bg-surface-800"
          @click="go('/posts/new')"
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
        v-if="composeOpen"
        class="fixed inset-0 z-40 bg-surface-950/15 md:hidden"
        @click="composeOpen = false"
      />
    </Transition>
  </Teleport>
</template>
