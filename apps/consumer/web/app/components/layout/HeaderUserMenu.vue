<script setup lang="ts">
  import { ChevronRight } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import { displayName } from '~/utils/user'

  const { user, roleLabel, menuItems, logoutPending } = useUserMenu()
  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const menuVisible = ref(false)

  function toggleMenu(event: MouseEvent) {
    menu.value?.toggle(event)
  }
</script>

<template>
  <div v-if="user" class="relative flex items-center gap-2">
    <Button
      :aria-label="`打开 ${displayName(user)} 的用户菜单`"
      :aria-expanded="menuVisible"
      aria-haspopup="menu"
      class="rounded-full! bg-transparent! p-1.5!"
      rounded
      severity="secondary"
      variant="text"
      :disabled="logoutPending"
      @click="toggleMenu"
    >
      <Avatar :user="user" shape="circle" class="size-8!" />
    </Button>

    <Menu
      ref="menu"
      :model="menuItems"
      popup
      append-to="self"
      aria-label="用户菜单"
      :pt="{
        root: {
          class: 'top-full! start-auto! end-0! z-50! mt-2! w-60!',
        },
        list: { class: 'py-1!' },
      }"
      @show="menuVisible = true"
      @hide="menuVisible = false"
    >
      <template #start>
        <LayoutHeaderUserMenuSummary :user="user" :role-label="roleLabel" />
      </template>

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
          <template v-if="item.key === 'hikari-points'">
            <span class="ml-auto font-semibold text-primary">{{ item.balance }}</span>
            <ChevronRight class="size-4 shrink-0 text-muted-color" aria-hidden="true" />
          </template>
          <span v-else-if="item.key === 'theme'" class="ml-auto text-xs text-muted-color">
            {{ item.modeLabel }}
          </span>
        </a>
      </template>
    </Menu>
  </div>
</template>
