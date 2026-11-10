<script setup lang="ts">
  import { Button, IconButton, Inline, Space, Stack } from '@hina-ui/vue'
  import { useScroll } from '@vueuse/core'
  import { ArrowLeft, LogIn, Menu } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { NuxtLink } from '#components'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { HEADER_NAV_ITEMS, SITE_CONFIG } from '~/config/site'
  import { useHeaderPromoNav } from '~/features/promotion/useHeaderPromoNav'
  import { TRANSITION_FAST } from '~/lib/motion'
  import { cn } from '~/utils/cn'

  const props = withDefaults(defineProps<{ flush?: boolean }>(), { flush: false })

  const route = useRoute()
  const router = useRouter()
  const auth = useAuthStore()
  const { loginTo, registerTo } = useAuthReturn()
  const { toLogin } = useAuthGate()
  const { y } = useScroll(() => (import.meta.client ? window : null))
  const mounted = useMounted()
  const transparent = computed(() => !props.flush && y.value <= 8)
  const menuOpen = ref(false)
  const { items: promoItems } = useHeaderPromoNav()

  const headerTitle = useState<string>('hikari:header-title', () => '')
  const isTopLevel = computed(() => HEADER_NAV_ITEMS.some(item => item.to === route.path))
  const showMobileTitle = computed(
    () => mounted.value && !isTopLevel.value && Boolean(headerTitle.value),
  )

  function goBack() {
    if (import.meta.client && window.history.state?.back) router.back()
    else void navigateTo('/')
  }
  const headerSurfaceClass = computed(() =>
    cn(
      'absolute inset-0 origin-top border-b bg-surface/72 backdrop-blur-xl backdrop-saturate-200',
      'transition-[opacity,transform,box-shadow,border-color] duration-250 ease-out will-change-[opacity,transform]',
      transparent.value
        ? '-translate-y-1 scale-y-95 border-transparent opacity-0 shadow-none'
        : props.flush
          ? 'translate-y-0 scale-y-100 border-transparent opacity-100 shadow-none'
          : 'translate-y-0 scale-y-100 border-line opacity-100 shadow-xs',
    ),
  )
</script>

<template>
  <Stack
    as="header"
    gap="none"
    class="fixed inset-x-0 top-0 z-50 hn-scrollbar-safe h-(--app-header-height)"
  >
    <Stack gap="none" :class="headerSurfaceClass" aria-hidden="true" />

    <Inline
      gap="md"
      align="center"
      justify="between"
      :wrap="false"
      class="relative mx-auto h-(--app-header-height) w-full max-w-header px-4"
    >
      <Inline gap="lg" align="center" :wrap="false" class="min-w-0">
        <IconButton
          v-if="!showMobileTitle"
          label="菜单"
          :tooltip="false"
          pill
          aria-haspopup="dialog"
          :aria-expanded="menuOpen"
          class="-ml-1.5 lg:hidden"
          @click="menuOpen = true"
        >
          <Menu aria-hidden="true" />
        </IconButton>
        <LayoutHeaderMobileMenu v-model:open="menuOpen" :promo-items="promoItems" />

        <Inline
          v-if="showMobileTitle"
          gap="none"
          align="center"
          :wrap="false"
          class="min-w-0 gap-1 lg:hidden"
        >
          <IconButton label="返回" :tooltip="false" pill class="-ml-1.5" @click="goBack">
            <ArrowLeft aria-hidden="true" />
          </IconButton>
          <AnimatePresence mode="wait" :initial="false">
            <motion.span
              :key="headerTitle"
              class="truncate text-base font-semibold text-fg"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="TRANSITION_FAST"
            >
              {{ headerTitle }}
            </motion.span>
          </AnimatePresence>
        </Inline>

        <NuxtLink
          :class="cn('shrink-0 items-center', showMobileTitle ? 'hidden lg:flex' : 'flex')"
          to="/"
          :aria-label="SITE_CONFIG.name"
        >
          <HikariImage
            :src="logoUrl"
            :alt="SITE_CONFIG.name"
            class="aspect-792/191 h-5 lg:h-7"
            image-class="object-contain"
            :lazy="false"
            :skeleton="false"
            :preload="{ fetchPriority: 'high' }"
          />
        </NuxtLink>
        <LayoutHeaderDesktopNav :promo-items="promoItems" />
      </Inline>

      <Inline as="nav" gap="sm" align="center" :wrap="false" class="shrink-0">
        <LayoutHeaderSearch />
        <ThemeToggle v-if="!auth.isAuthenticated" />
        <LayoutHeaderNotificationBell v-if="auth.isAuthenticated && auth.user" />
        <template v-if="auth.isAuthenticated && auth.user">
          <LayoutHeaderUserMenu />
        </template>
        <template v-else-if="auth.loaded && !auth.loading">
          <IconButton
            label="登录"
            :tooltip="false"
            pill
            class="lg:hidden"
            @click="toLogin('login')"
          >
            <LogIn aria-hidden="true" />
          </IconButton>
          <Inline gap="sm" class="hidden lg:flex lg:gap-4">
            <Button :as="NuxtLink" :to="loginTo" variant="ghost" tone="neutral">登录</Button>
            <Button :as="NuxtLink" :to="registerTo">注册</Button>
          </Inline>
        </template>
        <Space v-else size="xs" class="size-9 lg:w-37" />
      </Inline>
    </Inline>
  </Stack>
</template>
