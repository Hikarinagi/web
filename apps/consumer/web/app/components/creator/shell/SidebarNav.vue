<script setup lang="ts">
  import { motion } from 'motion-v'
  import { CREATOR_NAV } from '~/features/creator/nav'
  import { TRANSITION } from '~/lib/motion'
  import { cn } from '~/utils/cn'

  const props = withDefaults(defineProps<{ collapsed?: boolean }>(), {
    collapsed: false,
  })

  const route = useRoute()
  const { canAny } = useCreatorPermissions()
  const labelMotion = computed(() => ({
    opacity: props.collapsed ? 0 : 1,
    x: props.collapsed ? -6 : 0,
  }))
  const groupLabelMotion = computed(() => ({
    height: props.collapsed ? 0 : 20,
    marginBottom: props.collapsed ? 0 : 4,
    opacity: props.collapsed ? 0 : 1,
    x: props.collapsed ? -6 : 0,
  }))

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

  function itemClass(active: boolean) {
    return cn(
      'flex h-10 w-full items-center gap-2.5 overflow-hidden rounded-lg px-3 text-sm font-medium transition-colors duration-150',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-300 dark:hover:bg-surface-800 dark:hover:text-surface-0',
    )
  }
</script>

<template>
  <nav class="flex w-full flex-col gap-5" aria-label="创作者中心导航">
    <div v-for="(group, index) in groups" :key="index" class="flex w-full flex-col">
      <motion.p
        v-if="group.label"
        class="overflow-hidden px-3 text-xs font-semibold tracking-wide whitespace-nowrap text-muted-color uppercase"
        :initial="groupLabelMotion"
        :animate="groupLabelMotion"
        :transition="TRANSITION"
        :aria-hidden="collapsed"
      >
        {{ group.label }}
      </motion.p>
      <NuxtLink
        v-for="(item, itemIndex) in group.items"
        :key="item.to"
        v-tooltip.right="collapsed ? item.label : null"
        :to="item.to"
        :class="[itemClass(isActive(item.to)), itemIndex > 0 ? (collapsed ? 'mt-2' : 'mt-1') : '']"
        :aria-label="collapsed ? item.label : undefined"
        :aria-current="isActive(item.to) ? 'page' : undefined"
      >
        <component :is="item.icon" class="size-4 shrink-0" aria-hidden="true" />
        <motion.span
          class="min-w-0 overflow-hidden whitespace-nowrap"
          :initial="labelMotion"
          :animate="labelMotion"
          :transition="TRANSITION"
          :aria-hidden="collapsed"
        >
          <span class="block truncate">{{ item.label }}</span>
        </motion.span>
      </NuxtLink>
    </div>
  </nav>
</template>
