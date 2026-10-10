<script setup lang="ts">
  import { Flex, NavLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Download, Package, Shirt } from '@lucide/vue'

  defineOptions({ name: 'MeNav' })

  const route = useRoute()

  const items = [
    { label: '我的装扮', icon: Shirt, to: '/me/decoration' },
    { label: '我的道具', icon: Package, to: '/me/items' },
    { label: '下载中心', icon: Download, to: '/me/downloads' },
  ]
</script>

<template>
  <Flex as="nav" gap="xs" class="overflow-x-auto lg:flex-col">
    <NavLink
      v-for="item in items"
      :key="item.to"
      :as="NuxtLink"
      :to="item.to"
      :label="item.label"
      :active="route.path === item.to"
      class="shrink-0"
    >
      <template #icon><component :is="item.icon" /></template>
      {{ item.label }}
    </NavLink>
  </Flex>
</template>
