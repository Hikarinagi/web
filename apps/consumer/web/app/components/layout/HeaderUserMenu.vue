<script setup lang="ts">
  import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    IconButton,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import { displayName } from '~/utils/user'

  const { user, roleLabel, menuItems, logoutPending } = useUserMenu()
</script>

<template>
  <DropdownMenu v-if="user" label="用户菜单" align="end" class="w-60">
    <IconButton
      :label="`打开 ${displayName(user)} 的用户菜单`"
      :tooltip="false"
      :disabled="logoutPending"
      pill
      aria-haspopup="menu"
    >
      <Avatar :user="user" shape="circle" class="size-8!" />
    </IconButton>

    <template #content>
      <LayoutHeaderUserMenuSummary :user="user" :role-label="roleLabel" />

      <template v-for="(item, index) in menuItems" :key="item.key ?? index">
        <DropdownMenuSeparator v-if="item.separator" />
        <DropdownMenuItem
          v-else
          :tone="item.danger ? 'danger' : undefined"
          @select="item.command?.()"
        >
          <template #icon>
            <component :is="item.iconComponent" aria-hidden="true" />
          </template>
          {{ item.label }}
          <template v-if="item.key === 'hikari-points'" #trailing>
            <Text as="span" size="sm" weight="semibold" class="text-accent-text">
              {{ item.balance }}
            </Text>
            <ChevronRight aria-hidden="true" />
          </template>
          <template v-else-if="item.key === 'theme'" #trailing>
            <Text as="span" size="xs" tone="muted">{{ item.modeLabel }}</Text>
          </template>
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>
