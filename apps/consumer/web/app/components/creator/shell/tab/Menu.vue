<script setup lang="ts">
  import {
    Button,
    Divider,
    Empty,
    IconButton,
    Indicator,
    Popover,
    ScrollArea,
    SearchInput,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ChevronDown, Pin } from '@lucide/vue'
  import { tabIcon } from '~/features/creator/tab-icons'
  import type { CreatorTab } from '~/features/creator/tabs'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'CreatorShellTabMenu' })

  const store = useCreatorTabsStore()
  const actions = useCreatorTabActions()
  const open = ref(false)
  const query = ref('')

  const matches = (tab: CreatorTab) =>
    tab.title.toLowerCase().includes(query.value.trim().toLowerCase())
  const shown = computed(() => store.tabs.filter(matches))
  const recent = computed(() => store.closed.filter(matches))

  watch(open, next => {
    if (next) query.value = ''
  })

  function pick(tab: CreatorTab) {
    open.value = false
    void actions.open(tab)
  }

  function revive(tab: CreatorTab) {
    open.value = false
    actions.reopen(tab.id)
  }
</script>

<template>
  <Popover v-model:open="open" align="end">
    <IconButton variant="ghost" tone="neutral" size="sm" label="全部标签页" class="shrink-0">
      <ChevronDown />
    </IconButton>
    <template #content>
      <Stack gap="sm" class="w-80">
        <SearchInput v-model="query" size="sm" aria-label="筛选标签页" placeholder="筛选标签页" />
        <ScrollArea class="max-h-96">
          <Stack gap="none">
            <Button
              v-for="tab in shown"
              :key="tab.id"
              variant="ghost"
              tone="neutral"
              size="sm"
              :class="cn('justify-start', store.activeId === tab.id && 'bg-subtle')"
              @click="pick(tab)"
            >
              <template #icon><component :is="tabIcon(tab)" /></template>
              <Text as="span" size="sm" truncate class="min-w-0 flex-1 text-start">
                {{ tab.title }}
              </Text>
              <Indicator v-if="actions.dirty(tab)" tone="accent" size="sm" label="有未保存的修改" />
              <Pin v-if="tab.pinned" class="size-3.5 text-faint" aria-label="已固定" role="img" />
            </Button>
            <Empty v-if="!shown.length" size="sm" title="没有符合的标签页" />
            <template v-if="recent.length">
              <Divider class="my-2" />
              <Text size="xs" tone="muted" class="px-2 pb-1">最近关闭</Text>
              <Button
                v-for="tab in recent"
                :key="`closed-${tab.id}`"
                variant="ghost"
                tone="neutral"
                size="sm"
                class="justify-start"
                @click="revive(tab)"
              >
                <template #icon><component :is="tabIcon(tab)" /></template>
                <Text as="span" size="sm" tone="muted" truncate class="min-w-0 flex-1 text-start">
                  {{ tab.title }}
                </Text>
              </Button>
            </template>
          </Stack>
        </ScrollArea>
      </Stack>
    </template>
  </Popover>
</template>
