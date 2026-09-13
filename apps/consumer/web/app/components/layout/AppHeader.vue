<script setup lang="ts">
  import { useScroll } from '@vueuse/core'
  import { ArrowLeft, LogIn } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import logoUrl from '~/assets/images/logo.png'
  import { HEADER_NAV_ITEMS, SITE_CONFIG } from '~/config/site'
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
      'absolute inset-0 origin-top border-b bg-surface-0/72 backdrop-blur-xl backdrop-saturate-[1.8] transition-[opacity,transform,box-shadow,border-color] duration-250 ease-out will-change-[opacity,transform] dark:bg-surface-950/68',
      transparent.value
        ? '-translate-y-1 scale-y-95 border-transparent opacity-0 shadow-none'
        : props.flush
          ? 'translate-y-0 scale-y-100 border-transparent opacity-100 shadow-none'
          : 'translate-y-0 scale-y-100 border-surface-200/75 opacity-100 shadow-[0_2px_5px_rgba(15,23,42,0.055)] dark:border-surface-800/75 dark:shadow-black/16',
    ),
  )
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 mr-(--p-scrollbar-width) h-(--app-header-height)">
    <div :class="headerSurfaceClass" aria-hidden="true" />

    <div
      class="relative mx-auto flex h-(--app-header-height) max-w-header items-center justify-between gap-4 px-4"
    >
      <div class="flex min-w-0 items-center gap-6">
        <div v-if="showMobileTitle" class="flex min-w-0 items-center gap-1 md:hidden">
          <Button
            unstyled
            aria-label="返回"
            class="-ml-1.5 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full text-color"
            @click="goBack"
          >
            <ArrowLeft class="size-5.5" aria-hidden="true" />
          </Button>
          <AnimatePresence mode="wait" :initial="false">
            <motion.h1
              :key="headerTitle"
              class="truncate text-base font-semibold text-color"
              :initial="{ opacity: 0, y: 8 }"
              :animate="{ opacity: 1, y: 0 }"
              :exit="{ opacity: 0, y: -8 }"
              :transition="TRANSITION_FAST"
            >
              {{ headerTitle }}
            </motion.h1>
          </AnimatePresence>
        </div>
        <NuxtLink
          :class="cn('shrink-0 items-center', showMobileTitle ? 'hidden md:flex' : 'flex')"
          to="/"
          :aria-label="SITE_CONFIG.name"
        >
          <HikariImage
            :src="logoUrl"
            :alt="SITE_CONFIG.name"
            class="aspect-963/183 h-5 md:h-7"
            image-class="object-contain"
            :lazy="false"
            :skeleton="false"
            :preload="{ fetchPriority: 'high' }"
          />
        </NuxtLink>
        <LayoutHeaderDesktopNav />
      </div>

      <nav class="flex shrink-0 items-center gap-2">
        <LayoutHeaderSearch />
        <ThemeToggle v-if="!auth.isAuthenticated" />
        <LayoutHeaderNotificationBell v-if="auth.isAuthenticated && auth.user" />
        <template v-if="auth.isAuthenticated && auth.user">
          <LayoutHeaderUserMenu />
        </template>
        <template v-else-if="auth.loaded && !auth.loading">
          <Button
            rounded
            class="md:hidden!"
            severity="secondary"
            variant="text"
            aria-label="登录"
            @click="toLogin('login')"
          >
            <template #icon><LogIn class="text-color" aria-hidden="true" /></template>
          </Button>
          <div class="hidden items-center gap-2 md:flex md:gap-4">
            <NuxtLink :to="loginTo">
              <Button as="span" label="登录" variant="text" />
            </NuxtLink>
            <NuxtLink :to="registerTo">
              <Button as="span" label="注册" class="px-4! py-1.5!" />
            </NuxtLink>
          </div>
        </template>
        <div v-else class="h-10 w-10 md:w-32" aria-hidden="true" />
      </nav>
    </div>
  </header>
</template>
