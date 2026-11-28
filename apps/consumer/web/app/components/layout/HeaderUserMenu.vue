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
  const { t } = useLocaleText()
</script>

<template>
  <DropdownMenu v-if="user" :label="t('layout.header.userMenu')" align="end" class="w-60">
    <IconButton
      :label="t('layout.header.openUserMenu', { name: displayName(user) })"
      :tooltip="false"
      :disabled="logoutPending"
      pill
      aria-haspopup="menu"
    >
      <Avatar :user="user" class="size-8!" />
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
          {{ item.label ? t(item.label) : '' }}
          <template v-if="item.key === 'hikari-points'" #trailing>
            <Text as="span" size="sm" weight="semibold" class="text-accent-text">
              {{ item.balance }}
            </Text>
            <ChevronRight aria-hidden="true" />
          </template>
          <template v-else-if="item.key === 'theme'" #trailing>
            <Text as="span" size="xs" tone="muted">
              {{ item.modeLabel ? t(item.modeLabel) : '' }}
            </Text>
          </template>
          <template v-else-if="item.trailing" #trailing>
            <Text as="span" size="xs" class="text-accent-text">{{ item.trailing }}</Text>
          </template>
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>
