<script setup lang="ts">
  import { NavLink, SidebarGroup } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { CREATOR_NAV } from '~/features/creator/nav'

  defineOptions({ name: 'CreatorShellSidebarNav' })

  const route = useRoute()
  const { canAny } = useCreatorPermissions()

  const groups = computed(() =>
    CREATOR_NAV.map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || canAny(item.permission)),
    })).filter(group => group.items.length > 0),
  )

  function isActive(to: string): boolean {
    if (to === '/create') return route.path === '/create'
    return route.path === to || route.path.startsWith(`${to}/`)
  }
</script>

<template>
  <template v-for="(group, index) in groups" :key="index">
    <SidebarGroup v-if="group.label" :label="group.label">
      <NavLink
        v-for="item in group.items"
        :key="item.to"
        :as="NuxtLink"
        :to="item.to"
        :label="item.label"
        :active="isActive(item.to)"
      >
        <template #icon><component :is="item.icon" /></template>
        {{ item.label }}
      </NavLink>
    </SidebarGroup>

    <template v-else>
      <NavLink
        v-for="item in group.items"
        :key="item.to"
        :as="NuxtLink"
        :to="item.to"
        :label="item.label"
        :active="isActive(item.to)"
      >
        <template #icon><component :is="item.icon" /></template>
        {{ item.label }}
      </NavLink>
    </template>
  </template>
</template>
