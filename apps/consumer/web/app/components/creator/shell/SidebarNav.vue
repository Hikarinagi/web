<script setup lang="ts">
  import { SidebarGroup } from '@hina-ui/vue'
  import { CREATOR_NAV } from '~/features/creator/nav'

  defineOptions({ name: 'CreatorShellSidebarNav' })

  const { canAny } = useCreatorPermissions()

  const groups = computed(() =>
    CREATOR_NAV.map(group => ({
      ...group,
      items: group.items.filter(item => !item.permission || canAny(item.permission)),
    })).filter(group => group.items.length > 0),
  )
</script>

<template>
  <template v-for="(group, index) in groups" :key="index">
    <SidebarGroup v-if="group.label" :label="group.label">
      <CreatorShellNavItem v-for="item in group.items" :key="item.label" :item="item" />
    </SidebarGroup>
    <template v-else>
      <CreatorShellNavItem v-for="item in group.items" :key="item.label" :item="item" />
    </template>
  </template>
</template>
