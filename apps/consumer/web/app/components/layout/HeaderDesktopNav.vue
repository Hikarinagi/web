<script setup lang="ts">
  import { Inline, NavLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import {
    BookImage,
    BookOpen,
    BookUp,
    GamepadDirectional,
    MessagesSquare,
    Smartphone,
  } from '@lucide/vue'
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
    bookUp: BookUp,
    messagesSquare: MessagesSquare,
    smartphone: Smartphone,
  } satisfies Record<HeaderNavIcon, Component>

  function isActive(item: HeaderNavItem) {
    if (item.match === 'exact') return route.path === item.to

    return route.path === item.to || route.path.startsWith(`${item.to}/`)
  }
</script>

<template>
  <Inline
    as="nav"
    gap="none"
    align="center"
    :wrap="false"
    class="hidden lg:flex"
    aria-label="主导航"
  >
    <Inline
      gap="xs"
      align="center"
      :wrap="false"
      class="rounded-full border border-line bg-surface/42 p-1 shadow-xs backdrop-blur-xl backdrop-saturate-200"
    >
      <LayoutHeaderNavBadge v-for="item in navItems" :key="item.to" :badge="item.badge">
        <NavLink
          :as="NuxtLink"
          :to="item.to"
          :active="isActive(item)"
          :class="
            cn(
              'rounded-full ps-2.5 pe-2.5 font-medium xl:ps-3 xl:pe-3',
              isActive(item) && 'text-accent-text',
            )
          "
        >
          <template #icon>
            <component :is="navIconMap[item.icon]" aria-hidden="true" />
          </template>
          {{ item.label }}
        </NavLink>
      </LayoutHeaderNavBadge>

      <NavLink
        v-for="item in promoItems"
        :key="`promo-${item.id}`"
        :as="NuxtLink"
        :to="item.link"
        :target="item.open_in_new ? '_blank' : undefined"
        :class="
          cn('rounded-full font-medium', item.icon_only && item.icon ? 'ps-0 pe-0' : 'ps-3 pe-3')
        "
      >
        <template v-if="item.icon" #icon>
          <HikariImage
            :src="item.icon"
            :alt="item.label"
            :class="item.icon_only ? 'h-8 w-auto' : 'size-4'"
            :image-class="
              item.icon_only ? 'h-8 w-auto max-w-44 object-contain' : 'size-4 object-contain'
            "
            :skeleton="false"
            :lazy="false"
          />
        </template>
        <template v-if="!(item.icon_only && item.icon)">{{ item.label }}</template>
      </NavLink>
    </Inline>
  </Inline>
</template>
