<script setup lang="ts">
  import { Flex, NavLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Bell, ShieldCheck, SlidersHorizontal, User } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingNav' })

  const route = useRoute()
  const { t } = useLocaleText()

  const items = [
    { label: 'setting.nav.profile', icon: User, to: '/setting' },
    { label: 'setting.nav.account', icon: ShieldCheck, to: '/setting/account' },
    { label: 'setting.nav.preference', icon: SlidersHorizontal, to: '/setting/preference' },
    { label: 'setting.nav.notification', icon: Bell, to: '/setting/notification' },
  ] as const
</script>

<template>
  <Flex as="nav" gap="xs" class="overflow-x-auto lg:flex-col">
    <NavLink
      v-for="item in items"
      :key="item.to"
      :as="NuxtLink"
      :to="item.to"
      :label="t(item.label)"
      :active="route.path === item.to"
      class="shrink-0"
    >
      <template #icon><component :is="item.icon" /></template>
      {{ t(item.label) }}
    </NavLink>
  </Flex>
</template>
