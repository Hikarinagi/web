<script setup lang="ts">
  import { ListTree } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import { GUIDE_SECTIONS } from '~/features/developer/guide'
  import type { ReferenceGroup } from '~~/server/features/developer/reference'
  import { useActiveSection } from '~/features/developer/useActiveSection'

  defineOptions({ name: 'DeveloperDocsShell' })
  const props = defineProps<{ groups: ReferenceGroup[] }>()

  const activeId = useActiveSection(() => [
    ...GUIDE_SECTIONS.map(section => section.id),
    'reference',
    ...props.groups.flatMap(group => group.operations.map(operation => operation.id)),
  ])

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const belowLg = breakpoints.smaller('lg')

  const open = ref(false)
  const { add } = useFloatingToolbar()
  add({
    id: 'developer-docs-nav',
    label: '文档目录',
    icon: ListTree,
    order: 5,
    visible: () => belowLg.value,
    onClick: () => {
      open.value = true
    },
  })
</script>

<template>
  <div class="mx-auto box-content flex max-w-header items-start px-6 py-10 lg:gap-10">
    <nav
      class="sticky top-[calc(var(--app-header-height)+24px)] hidden w-64 shrink-0 lg:block"
      aria-label="开发者文档导航"
    >
      <DeveloperDocsNav
        :groups
        :active-id="activeId"
        scroll-class="max-h-[calc(100vh-var(--app-header-height)-108px)]"
      />
    </nav>

    <div class="flex min-w-0 flex-1 flex-col gap-14">
      <slot />
    </div>

    <Drawer
      v-model:visible="open"
      position="bottom"
      :pt="{
        root: { class: 'app-mobile-sheet h-auto! max-h-[72vh]!' },
        content: { class: 'p-2!' },
      }"
    >
      <template #header>
        <h2 class="text-base font-semibold text-color">文档目录</h2>
      </template>

      <DeveloperDocsNav
        :groups
        :active-id="activeId"
        scroll-class="max-h-[calc(72vh-10.5rem)]"
        @navigate="open = false"
      />
    </Drawer>
  </div>
</template>
