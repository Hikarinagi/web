<script setup lang="ts">
  import { Flex, NavLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Bell, Package, ShieldCheck, SlidersHorizontal, Shirt, User } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingNav' })

  const route = useRoute()

  const items = computed(() => [
    { label: '个人资料', icon: User, to: '/setting' },
    { label: '我的装扮', icon: Shirt, to: '/setting/decoration' },
    { label: '我的道具', icon: Package, to: '/setting/items' },
    { label: '账号安全', icon: ShieldCheck, to: '/setting/account' },
    { label: '内容偏好', icon: SlidersHorizontal, to: '/setting/preference' },
    { label: '消息提醒', icon: Bell, to: '/setting/notification' },
  ])
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
