<script setup lang="ts">
  import { Drawer, NavLink, Stack, Tag } from '@hina-ui/vue'
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

  const open = defineModel<boolean>('open', { default: false })

  const route = useRoute()
  const navItems = useHeaderNav()
  const { items: promoItems } = useHeaderPromoNav()

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

  watch(
    () => route.fullPath,
    () => {
      open.value = false
    },
  )
</script>

<template>
  <Drawer v-model:open="open" title="菜单" side="start" size="sm" :header="false">
    <template #content>
      <Stack as="nav" gap="xs" aria-label="移动端菜单">
        <NavLink
          v-for="item in navItems"
          :key="item.to"
          :as="NuxtLink"
          :to="item.to"
          :active="isActive(item)"
          :class="isActive(item) ? 'text-accent-text' : undefined"
        >
          <template #icon>
            <component :is="navIconMap[item.icon]" aria-hidden="true" />
          </template>
          {{ item.label }}
          <Tag v-if="item.badge" size="sm" :tone="item.badge.tone ?? 'accent'" class="ms-1.5">
            {{ item.badge.label }}
          </Tag>
        </NavLink>

        <NavLink
          v-for="item in promoItems"
          :key="`promo-${item.id}`"
          :as="NuxtLink"
          :to="item.link"
          :target="item.open_in_new ? '_blank' : undefined"
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
      </Stack>
    </template>
    <template #footer>
      <LayoutSidebarFooter class="min-w-0 flex-1" />
    </template>
  </Drawer>
</template>
