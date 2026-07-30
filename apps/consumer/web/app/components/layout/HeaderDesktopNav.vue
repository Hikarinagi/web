<script setup lang="ts">
  import { BookImage, BookOpen, GamepadDirectional, MessagesSquare } from '@lucide/vue'
  import type { HeaderNavIcon, HeaderNavItem } from '~/config/site'
  import { useHeaderPromoNav } from '~/features/promotion/useHeaderPromoNav'
  import { cn } from '~/utils/cn'

  const route = useRoute()
  const { items: promoItems } = useHeaderPromoNav()
  const navItems = useHeaderNav()

  const navIconMap = {
    gamepad: GamepadDirectional,
    bookOpen: BookOpen,
    bookImage: BookImage,
    messagesSquare: MessagesSquare,
  } satisfies Record<HeaderNavIcon, Component>

  function isActive(item: HeaderNavItem) {
    if (item.match === 'exact') return route.path === item.to

    return route.path === item.to || route.path.startsWith(`${item.to}/`)
  }

  function itemClass(active: boolean) {
    return cn(
      'inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all duration-200 ease-out',
      'focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none',
      active
        ? 'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--p-primary-color),transparent_78%),0_1px_6px_color-mix(in_srgb,var(--p-primary-color),transparent_88%)]'
        : 'text-surface-600 hover:bg-primary/5 hover:text-primary dark:text-surface-300',
    )
  }

  const capsuleClass = cn(
    'inline-flex h-9 items-center rounded-full transition-opacity duration-200 ease-out hover:opacity-85',
    'focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:outline-none',
  )
</script>

<template>
  <nav class="hidden items-center md:flex" aria-label="主导航">
    <div
      class="flex items-center gap-1 rounded-full border border-surface-200/55 bg-surface-0/42 p-1 shadow-[0_1px_8px_rgba(15,23,42,0.045)] backdrop-blur-xl backdrop-saturate-[1.8] dark:border-surface-800/60 dark:bg-surface-950/38 dark:shadow-[0_1px_8px_rgba(0,0,0,0.18)]"
    >
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="itemClass(isActive(item))"
        :aria-current="isActive(item) ? 'location' : undefined"
      >
        <component :is="navIconMap[item.icon]" class="size-4" aria-hidden="true" />
        <span>{{ item.label }}</span>
      </NuxtLink>
      <NuxtLink
        v-for="item in promoItems"
        :key="`promo-${item.id}`"
        :to="item.link"
        :target="item.open_in_new ? '_blank' : undefined"
        :aria-label="item.icon_only ? item.label : undefined"
        :class="item.icon_only && item.icon ? capsuleClass : itemClass(false)"
      >
        <HikariImage
          v-if="item.icon_only && item.icon"
          :src="item.icon"
          :alt="item.label"
          class="h-8 w-auto"
          image-class="h-8 w-auto max-w-44 object-contain"
          :skeleton="false"
          :lazy="false"
        />
        <template v-else>
          <HikariImage
            v-if="item.icon"
            :src="item.icon"
            :alt="item.label"
            class="size-4"
            image-class="size-4 object-contain"
            :skeleton="false"
            :lazy="false"
          />
          <span>{{ item.label }}</span>
        </template>
      </NuxtLink>
    </div>
  </nav>
</template>
