<script setup lang="ts">
  import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CreatorCrumb } from '~/features/creator/composables/useCreatorPage'

  defineOptions({ name: 'CreatorShellCrumbs' })

  const { currentRoute } = useRouter()
  const published = useCreatorCrumbs()
  const mounted = useMounted()

  const items = computed<CreatorCrumb[]>(() => {
    const route = currentRoute.value
    const path = route.path
    const wiki =
      path === '/create/wiki' || path.startsWith('/create/wiki/') || path.startsWith('/entries/')
    const base: CreatorCrumb[] = [
      { label: '创作者中心', to: '/create' },
      ...(wiki ? [{ label: '维基工作台', to: '/create/wiki' }] : []),
    ]
    const own = mounted.value && published.value?.path === path ? published.value.items : []
    const title = route.meta.title as string | undefined
    const tail = own.length ? own : title ? [{ label: title }] : []
    return [...base, ...tail].filter(
      (item, index, all) => !(index > 0 && item.to && item.to === all[index - 1]?.to),
    )
  })
  const hidden = (index: number) => index < items.value.length - 2
  const lead = (index: number) => index < items.value.length - 1
</script>

<template>
  <Breadcrumb label="页面位置" class="min-w-0">
    <template v-for="(item, index) in items" :key="`${index}:${item.label}`">
      <BreadcrumbSeparator v-if="index > 0" :class="lead(index) ? 'max-md:hidden' : undefined" />
      <BreadcrumbItem
        v-if="index < items.length - 1 && item.to"
        :as="NuxtLink"
        :to="item.to"
        :class="hidden(index) ? 'max-md:hidden' : undefined"
      >
        {{ item.label }}
      </BreadcrumbItem>
      <BreadcrumbItem
        v-else
        as="span"
        :current="index === items.length - 1"
        :class="hidden(index) ? 'max-md:hidden' : undefined"
      >
        {{ item.label }}
      </BreadcrumbItem>
    </template>
  </Breadcrumb>
</template>
