<script setup lang="ts">
  import { IconButton, Inline, ScrollArea, Space } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import Sortable from 'sortablejs'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'CreatorShellTabStrip' })

  const store = useCreatorTabsStore()
  const actions = useCreatorTabActions()
  const nav = useTabNav()
  const list = useTemplateRef<ComponentPublicInstance>('list')
  const mounted = useMounted()
  let sortable: Sortable | null = null
  useTabShortcuts()

  function reveal(id: string) {
    const root = list.value?.$el as HTMLElement | undefined
    root
      ?.querySelector<HTMLElement>(`[data-tab-id="${CSS.escape(id)}"]`)
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }

  onMounted(() => {
    watch(
      () => store.activeId,
      id => nextTick(() => reveal(id)),
      { immediate: true },
    )
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
      class="h-full min-w-0 shrink"
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
        <template v-if="mounted">
          <CreatorShellTabItem
            v-for="(tab, index) in store.tabs"
            :key="tab.id"
            :tab="tab"
            :index="index"
          />
        </template>
      </Inline>
    </ScrollArea>
    <IconButton
      variant="ghost"
      tone="neutral"
      size="sm"
      label="新建标签页"
      class="shrink-0 self-center"
      @click="nav.open('/create/wiki', true)"
    >
      <Plus />
    </IconButton>
    <Space />
    <CreatorShellTabMenu class="self-center" />
  </Inline>
  <CreatorShellCloseConfirm @close="id => actions.remove([id])" />
</template>
