<script setup lang="ts">
  import {
    Card,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuSub,
    Inline,
    SidebarLabel,
    Stack,
    Text,
    type SidebarState,
  } from '@hina-ui/vue'
  import { ChevronUp, House, LogOut, Settings, UserRound } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'CreatorShellSidebarUser' })

  const props = withDefaults(defineProps<{ state?: SidebarState }>(), { state: 'expanded' })

  const auth = useAuthStore()
  const { open: openLogout } = useLogout()
  const theme = useThemeMode()
  const { t } = useLocaleText()

  const user = computed(() => auth.user)
  const roleLabel = computed(() => getUserRoleLabel(user.value?.role))
  const rail = computed(() => props.state === 'rail')
</script>

<template>
  <DropdownMenu
    v-if="user"
    :label="t('layout.header.userMenu')"
    align="start"
    side="top"
    class="w-48"
  >
    <Card
      v-tooltip="rail ? { content: displayName(user), side: 'right' } : null"
      as="button"
      type="button"
      :padded="false"
      :aria-label="t('layout.header.openUserMenu', { name: displayName(user) })"
      :class="
        cn(
          'hn-state-layer block w-full hn-interactive overflow-visible text-start hn-press-none',
          'rounded-lg border-0 bg-transparent shadow-none',
        )
      "
    >
      <Inline gap="sm" align="center" :wrap="false">
        <Avatar :user="user" class="shrink-0" />
        <SidebarLabel as="div" class="min-w-0 flex-1">
          <Inline gap="sm" align="center" :wrap="false">
            <Stack gap="none" class="min-w-0 flex-1">
              <UserName :user="user" class="min-w-0 text-sm font-medium" />
              <Text as="span" size="xs" tone="muted" truncate>{{ roleLabel }}</Text>
            </Stack>
            <ChevronUp class="size-4 shrink-0 text-muted" aria-hidden="true" />
          </Inline>
        </SidebarLabel>
      </Inline>
    </Card>

    <template #content>
      <DropdownMenuItem @select="navigateTo(`/space/${user?.id}`)">
        <template #icon><UserRound /></template>
        {{ t('layout.userMenu.space') }}
      </DropdownMenuItem>
      <DropdownMenuItem @select="navigateTo('/setting')">
        <template #icon><Settings /></template>
        {{ t('layout.userMenu.account') }}
      </DropdownMenuItem>
      <DropdownMenuSub :label="t('layout.userMenu.theme')">
        <template #icon><component :is="theme.current.value.icon" /></template>
        <DropdownMenuRadioGroup
          :model-value="theme.current.value.value"
          @update:model-value="theme.set"
        >
          <DropdownMenuRadioItem v-for="mode in theme.modes" :key="mode.value" :value="mode.value">
            {{ t(mode.label) }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuSub>
      <DropdownMenuSeparator />
      <DropdownMenuItem @select="navigateTo('/')">
        <template #icon><House /></template>
        {{ t('common.home') }}
      </DropdownMenuItem>
      <DropdownMenuItem tone="danger" @select="openLogout">
        <template #icon><LogOut /></template>
        {{ t('layout.userMenu.logout') }}
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
