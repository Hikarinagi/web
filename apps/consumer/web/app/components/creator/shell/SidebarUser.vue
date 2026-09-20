<script setup lang="ts">
  import { ChevronUp, LogOut, Settings, UserRound } from '@lucide/vue'
  import { motion } from 'motion-v'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import { TRANSITION } from '~/lib/motion'
  import { displayName } from '~/utils/user'

  const componentProps = withDefaults(defineProps<{ collapsed?: boolean }>(), {
    collapsed: false,
  })

  const auth = useAuthStore()
  const { open: openLogout } = useLogout()
  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const menuVisible = ref(false)

  const user = computed(() => auth.user)
  const roleLabel = computed(() => getUserRoleLabel(user.value?.role))
  const contentMotion = computed(() => ({
    x: componentProps.collapsed ? -6 : 0,
  }))
  const labelMotion = computed(() => ({
    opacity: componentProps.collapsed ? 0 : 1,
  }))
  const iconMotion = computed(() => ({
    opacity: componentProps.collapsed ? 0 : 1,
  }))
  const menuItems = computed<MenuItem[]>(() => [
    {
      label: '个人空间',
      iconComponent: UserRound,
      command: () => void navigateTo(`/space/${user.value?.id}`),
    },
    {
      label: '账号设置',
      iconComponent: Settings,
      command: () => void navigateTo('/setting'),
    },
    { separator: true },
    {
      label: '退出登录',
      iconComponent: LogOut,
      danger: true,
      command: openLogout,
    },
  ])

  function toggleMenu(event: MouseEvent) {
    menu.value?.toggle(event)
  }
</script>

<template>
  <div v-if="user" class="shrink-0 border-t border-surface-200 pt-3 dark:border-surface-800">
    <Button
      v-tooltip.right="collapsed ? displayName(user) : null"
      unstyled
      type="button"
      :aria-label="`${displayName(user)} 的账号菜单`"
      :aria-expanded="menuVisible"
      aria-haspopup="menu"
      class="block w-full overflow-hidden rounded-lg text-left transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
      @click="toggleMenu"
    >
      <motion.span
        class="flex items-center gap-2.5 px-2 py-2"
        :initial="contentMotion"
        :animate="contentMotion"
        :transition="TRANSITION"
      >
        <Avatar :user="user" shape="circle" class="size-9! shrink-0" />
        <motion.span
          class="flex min-w-0 flex-1 flex-col overflow-hidden"
          :initial="labelMotion"
          :animate="labelMotion"
          :transition="TRANSITION"
          :aria-hidden="collapsed"
        >
          <UserName :user="user" class="min-w-0 text-sm font-medium" />
          <span class="truncate text-xs text-muted-color">{{ roleLabel }}</span>
        </motion.span>
        <motion.span
          class="overflow-hidden text-muted-color"
          :initial="iconMotion"
          :animate="iconMotion"
          :transition="TRANSITION"
          :aria-hidden="collapsed"
        >
          <ChevronUp class="size-4 shrink-0" aria-hidden="true" />
        </motion.span>
      </motion.span>
    </Button>

    <Menu
      ref="menu"
      :model="menuItems"
      popup
      aria-label="账号菜单"
      :pt="{ list: { class: 'py-1!' } }"
      @show="menuVisible = true"
      @hide="menuVisible = false"
    >
      <template #item="{ item, props }">
        <a
          v-ripple
          v-bind="props.action"
          :class="[
            'flex items-center gap-3 px-4 py-2.5 text-sm',
            item.danger ? 'text-red-500!' : '',
          ]"
        >
          <component :is="item.iconComponent" class="size-4 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>
