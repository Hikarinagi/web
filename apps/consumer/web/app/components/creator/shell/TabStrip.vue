<script setup lang="ts">
  import { Inline, ScrollArea } from '@hina-ui/vue'
  import Sortable from 'sortablejs'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'CreatorShellTabStrip' })

  const route = useRoute()
  const store = useCreatorTabsStore()
  const actions = useCreatorTabActions()
  const list = useTemplateRef<ComponentPublicInstance>('list')
  let sortable: Sortable | null = null
  useTabShortcuts()

  const visit = (path: string) =>
    store.visit(path, (route.meta.title as string | undefined) ?? '创作者中心')

  function reveal(key: string) {
    const root = list.value?.$el as HTMLElement | undefined
    root
      ?.querySelector<HTMLElement>(`[data-tab-key="${CSS.escape(key)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  onMounted(() => {
    visit(route.fullPath)
    watch(() => route.fullPath, visit)
    watch(actions.active, key => nextTick(() => reveal(key)), { immediate: true })
    const root = list.value?.$el as HTMLElement | undefined
    if (!root) return
    sortable = Sortable.create(root, {
      animation: 150,
      direction: 'horizontal',
      draggable: '[data-creator-tab]',
      ghostClass: 'opacity-40',
      onMove: event => event.dragged.dataset.pinned === event.related.dataset.pinned,
      onEnd: event => {
        const { item, from, oldIndex, newIndex } = event
        if (oldIndex == null || newIndex == null || oldIndex === newIndex) return
        from.removeChild(item)
        from.insertBefore(item, from.children[oldIndex] ?? null)
        store.move(oldIndex, newIndex)
      },
    })
  })
  onBeforeUnmount(() => sortable?.destroy())
</script>

<template>
  <Inline gap="none" align="stretch" :wrap="false" class="h-full min-w-0 flex-1">
    <ScrollArea
      direction="horizontal"
      :scrollbar="false"
      label="打开的标签页"
      class="h-full min-w-0 flex-1"
    >
      <Inline
        ref="list"
        role="tablist"
        aria-label="打开的标签页"
        gap="none"
        align="stretch"
        :wrap="false"
        class="h-full"
      >
        <CreatorShellTabItem
          v-for="(tab, index) in store.tabs"
          :key="tab.key"
          :tab="tab"
          :index="index"
        />
      </Inline>
    </ScrollArea>
    <CreatorShellTabMenu class="self-center" />
  </Inline>
  <CreatorShellCloseConfirm @close="key => actions.remove([key])" />
</template>
