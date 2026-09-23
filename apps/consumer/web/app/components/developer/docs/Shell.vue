<script setup lang="ts">
  import { Inline, Sheet, Stack } from '@hina-ui/vue'
  import { ListTree } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import type { GuideNavItem } from '~/features/developer/useGuide'
  import type { ReferenceNavGroup } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperDocsShell' })
  defineProps<{ groups: ReferenceNavGroup[]; sections: GuideNavItem[] }>()

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
  <Inline gap="none" align="start" :wrap="false" class="mx-auto w-full max-w-header lg:gap-10">
    <Stack
      as="nav"
      gap="none"
      aria-label="开发者文档导航"
      class="sticky top-(--app-header-height) hidden w-64 shrink-0 py-8 ps-4 sm:ps-6 lg:block"
    >
      <DeveloperDocsNav
        :groups
        :sections
        scroll-class="max-h-[calc(100vh-var(--app-header-height)-8rem)]"
      />
    </Stack>

    <Stack gap="none" class="min-w-0 flex-1">
      <slot />
    </Stack>

    <Sheet v-model:open="open" title="文档目录" class="h-[60dvh]">
      <template #content>
        <DeveloperDocsNav :groups :sections scroll-class="max-h-none" @navigate="open = false" />
      </template>
    </Sheet>
  </Inline>
</template>
