<script setup lang="ts">
  import { List } from '@lucide/vue'
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
  const open = ref(false)
</script>

<template>
  <div class="mx-auto box-content flex max-w-header items-start gap-10 px-6 py-10">
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

    <div class="lg:hidden">
      <div class="fixed right-5 bottom-[calc(var(--app-bottombar-height)+16px)] z-20">
        <Button rounded class="shadow-lg" aria-label="文档目录" @click="open = true">
          <template #icon><List class="size-5" /></template>
        </Button>
      </div>

      <Drawer v-model:visible="open" position="bottom" header="文档目录" class="h-[70vh]">
        <DeveloperDocsNav
          :groups
          :active-id="activeId"
          scroll-class="max-h-[calc(70vh-9rem)]"
          @navigate="open = false"
        />
      </Drawer>
    </div>
  </div>
</template>
