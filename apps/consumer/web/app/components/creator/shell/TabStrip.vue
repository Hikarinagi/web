<script setup lang="ts">
  import {
    Button,
    CloseButton,
    ContextMenu,
    ContextMenuItem,
    ContextMenuSeparator,
    Indicator,
    Inline,
    ScrollArea,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { tabKey, type CreatorTab } from '~/features/creator/tabs'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'CreatorShellTabStrip' })

  const route = useRoute()
  const router = useRouter()
  const store = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()
  const active = computed(() => tabKey(route.path))
  const dirty = (key: string) => drafts.count(key) > 0

  const visit = (path: string) =>
    store.visit(path, (route.meta.title as string | undefined) ?? '创作者中心')
  onMounted(() => {
    visit(route.fullPath)
    watch(() => route.fullPath, visit)
  })

  async function remove(keys: string[]) {
    if (keys.includes(active.value)) {
      const index = store.tabs.findIndex(tab => tab.key === active.value)
      const rest = store.tabs.filter(tab => !keys.includes(tab.key))
      const next = rest[Math.min(index, rest.length - 1)]
      store.close(keys)
      await navigateTo(next?.path ?? '/create')
      return
    }
    store.close(keys)
  }

  function close(keys: string[]) {
    const kept = keys.filter(dirty)
    if (keys.length === 1 && kept.length) {
      void router.replace({ query: { ...route.query, close: keys[0] } })
      return
    }
    if (kept.length) toast.info(`${kept.length} 个有未保存修改的标签页没有关闭`)
    void remove(keys.filter(key => !dirty(key)))
  }

  const others = (tab: CreatorTab) =>
    store.tabs.filter(item => item.key !== tab.key).map(item => item.key)
  const right = (tab: CreatorTab) =>
    store.tabs.slice(store.tabs.findIndex(item => item.key === tab.key) + 1).map(item => item.key)

  function middle(event: MouseEvent, tab: CreatorTab) {
    if (event.button === 1) close([tab.key])
  }
</script>

<template>
  <ScrollArea direction="horizontal" auto-hide="leave" label="打开的页面" class="min-w-0 flex-1">
    <Inline gap="xs" align="center" :wrap="false" class="py-1">
      <ContextMenu v-for="tab in store.tabs" :key="tab.key" :label="tab.title">
        <Inline
          gap="none"
          align="center"
          :wrap="false"
          :class="
            cn(
              'shrink-0 rounded-md pe-1',
              tab.key === active ? 'bg-subtle text-fg' : 'text-muted hover:bg-subtle',
            )
          "
          @auxclick="middle($event, tab)"
        >
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            :aria-current="tab.key === active ? 'page' : undefined"
            class="max-w-48"
            @click="navigateTo(tab.path)"
          >
            <Text as="span" size="sm" truncate>{{ tab.title }}</Text>
            <Indicator v-if="dirty(tab.key)" tone="accent" size="sm" label="有未保存的修改" />
          </Button>
          <CloseButton size="xs" :label="`关闭「${tab.title}」`" @click="close([tab.key])" />
        </Inline>
        <template #content>
          <ContextMenuItem @select="close([tab.key])">关闭</ContextMenuItem>
          <ContextMenuItem :disabled="!others(tab).length" @select="close(others(tab))">
            关闭其他标签页
          </ContextMenuItem>
          <ContextMenuItem :disabled="!right(tab).length" @select="close(right(tab))">
            关闭右侧的标签页
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem @select="close(store.tabs.map(item => item.key))">
            关闭全部标签页
          </ContextMenuItem>
        </template>
      </ContextMenu>
    </Inline>
  </ScrollArea>
  <CreatorShellCloseConfirm @close="key => remove([key])" />
</template>
