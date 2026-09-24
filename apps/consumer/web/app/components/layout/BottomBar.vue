<script setup lang="ts">
  import { Card, Center, Flex, Ripple, Stack, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import {
    BookImage,
    BookOpen,
    BookUp,
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
    bookUp: BookUp,
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
      'flex flex-1 flex-col items-center justify-center gap-1 transition-colors duration-200',
      'focus-visible:outline-none',
      active ? 'text-accent-text' : 'text-muted',
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
  <Stack
    as="nav"
    gap="none"
    :class="
      cn(
        'fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/85 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl backdrop-saturate-200 md:hidden',
        composeOpen && 'z-60',
      )
    "
    aria-label="移动端主导航"
  >
    <Flex class="mx-auto h-(--app-bottombar-height) w-full max-w-md px-1">
      <Flex class="flex-1">
        <NuxtLink
          v-for="item in leadingItems"
          :key="item.to"
          :to="item.to"
          :class="tabClass(isActive(item))"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <LayoutHeaderNavBadge :badge="item.badge">
            <component :is="navIconMap[item.icon]" class="size-5.5" aria-hidden="true" />
          </LayoutHeaderNavBadge>
          <Text as="span" size="xs" class="leading-none font-medium text-inherit">
            {{ item.label }}
          </Text>
        </NuxtLink>
      </Flex>

      <Center class="shrink-0 px-3">
        <IconButton
          login-required
          label="发布"
          :tooltip="false"
          variant="solid"
          tone="accent"
          pill
          aria-haspopup="menu"
          :aria-expanded="composeOpen"
          class="size-11!"
          @click="onPlus"
        >
          <Plus
            :size="26"
            :stroke-width="2.75"
            class="transition-transform duration-200"
            :class="{ 'rotate-45': composeOpen }"
            aria-hidden="true"
          />
        </IconButton>
      </Center>

      <Flex class="flex-1">
        <NuxtLink
          v-for="item in trailingItems"
          :key="item.to"
          :to="item.to"
          :class="tabClass(isActive(item))"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <LayoutHeaderNavBadge :badge="item.badge">
            <component :is="navIconMap[item.icon]" class="size-5.5" aria-hidden="true" />
          </LayoutHeaderNavBadge>
          <Text as="span" size="xs" class="leading-none font-medium text-inherit">
            {{ item.label }}
          </Text>
        </NuxtLink>
      </Flex>
    </Flex>
  </Stack>

  <Teleport to="body">
    <AnimatePresence>
      <motion.div
        v-if="composeOpen"
        key="compose-menu"
        role="menu"
        class="fixed left-1/2 z-70 flex w-max -translate-x-1/2 flex-col items-center gap-2.5 md:hidden"
        :style="composeMenuStyle"
        :initial="{ opacity: 0, y: 10 }"
        :animate="{ opacity: 1, y: 0 }"
        :exit="{ opacity: 0, y: 10 }"
        :transition="TRANSITION"
      >
        <Card
          as="button"
          role="menuitem"
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
          role="menuitem"
          :padded="false"
          class="hn-state-layer flex hn-interactive items-center gap-2.5 rounded-full py-1.5 pr-1.5 pl-4 text-sm font-medium shadow-lg"
          @click="go('/posts/new')"
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
        v-if="composeOpen"
        gap="none"
        class="hn-scrim fixed inset-0 z-59 md:hidden"
        @click="composeOpen = false"
      />
    </Transition>
  </Teleport>
</template>
