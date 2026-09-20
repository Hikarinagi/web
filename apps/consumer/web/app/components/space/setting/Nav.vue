<script setup lang="ts">
  import { Bell, ShieldCheck, SlidersHorizontal, Shirt, User } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingNav' })

  const route = useRoute()

  const items = computed(() => [
    { label: '个人资料', icon: User, to: '/setting' },
    { label: '我的装扮', icon: Shirt, to: '/setting/decoration' },
    { label: '账号安全', icon: ShieldCheck, to: '/setting/account' },
    { label: '内容偏好', icon: SlidersHorizontal, to: '/setting/preference' },
    { label: '消息提醒', icon: Bell, to: '/setting/notification' },
  ])
</script>

<template>
  <nav class="flex flex-row gap-1 overflow-x-auto lg:flex-col">
    <Button
      v-for="item in items"
      :key="item.to"
      as="router-link"
      :to="item.to"
      unstyled
      class="flex shrink-0 cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors"
      :class="
        route.path === item.to
          ? 'bg-primary/10 text-primary'
          : 'text-muted-color hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800/60'
      "
    >
      <component :is="item.icon" class="size-[18px] shrink-0" />
      <span>{{ item.label }}</span>
    </Button>
  </nav>
</template>
