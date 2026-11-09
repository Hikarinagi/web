<script setup lang="ts">
  import { Kbd, NavLink } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CreatorNavItem } from '~/features/creator/nav'
  import { useWikiFinder } from '~/features/wiki/composables/useWikiFinder'

  defineOptions({ name: 'CreatorShellNavItem' })

  const props = defineProps<{ item: CreatorNavItem }>()

  const { currentRoute } = useRouter()
  const finder = useWikiFinder()

  const link = computed(() =>
    props.item.filter ? { path: props.item.to, query: { f: props.item.filter } } : props.item.to,
  )

  const active = computed(() => {
    const route = currentRoute.value
    const item = props.item
    if (!item.to) return false
    const exact = item.to === '/create' || item.to === '/create/wiki'
    const within = [item.to, ...(item.also ?? [])].some(
      prefix => route.path === prefix || (!exact && route.path.startsWith(`${prefix}/`)),
    )
    if (!within) return false
    return item.to !== '/create/wiki/changes' || (route.query.f ?? undefined) === item.filter
  })
</script>

<template>
  <NavLink v-if="item.find" as="button" type="button" :label="item.label" @click="finder.show()">
    <template #icon><component :is="item.icon" /></template>
    {{ item.label }}
    <template #trailing><Kbd>Ctrl K</Kbd></template>
  </NavLink>
  <NavLink v-else :as="NuxtLink" :to="link" :label="item.label" :active="active">
    <template #icon><component :is="item.icon" /></template>
    {{ item.label }}
    <template v-if="item.unchecked" #trailing><CreatorShellUncheckedCount /></template>
  </NavLink>
</template>
