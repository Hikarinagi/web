<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  type UserItem = ApiData<'/api/v3/user', 'get'>['items'][number]

  const props = defineProps<{
    items: UserItem[]
    loading: boolean
    resolved: boolean
    query: string
    command: (item: UserItem) => void
  }>()

  const activeIndex = ref(0)

  watch(
    () => props.items,
    () => {
      activeIndex.value = 0
    },
  )

  function selectItem(idx: number) {
    const item = props.items[idx]
    if (!item) return
    props.command(item)
  }

  function onArrowDown() {
    if (!props.items.length) return
    activeIndex.value = (activeIndex.value + 1) % props.items.length
  }
  function onArrowUp() {
    if (!props.items.length) return
    activeIndex.value = (activeIndex.value - 1 + props.items.length) % props.items.length
  }
  function onEnter() {
    if (!props.items.length) return
    selectItem(activeIndex.value)
  }

  defineExpose({ onArrowDown, onArrowUp, onEnter })
</script>

<template>
  <ScrollArea
    class="max-h-72 w-72 rounded-lg border border-surface-200 bg-surface-0 shadow-lg dark:border-surface-700 dark:bg-surface-900"
  >
    <div v-if="loading || (query && !resolved)" class="flex flex-col gap-1 p-1">
      <div v-for="i in 3" :key="i" class="flex items-center gap-2 px-2 py-1.5">
        <Skeleton shape="circle" size="24px" />
        <Skeleton height="14px" width="60%" />
      </div>
    </div>
    <div v-else-if="!items.length" class="px-3 py-4 text-center text-sm text-muted-color">
      {{ query ? '未找到匹配用户' : '输入用户名搜索' }}
    </div>
    <div v-else class="flex flex-col gap-0.5 p-1">
      <Button
        v-for="(item, idx) in items"
        :key="item.id"
        unstyled
        type="button"
        :class="[
          'flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors',
          idx === activeIndex
            ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
            : 'text-color hover:bg-surface-100 dark:hover:bg-surface-800',
        ]"
        @click="selectItem(idx)"
        @mouseenter="activeIndex = idx"
      >
        <Avatar :user="item" size="normal" shape="circle" class="size-6!" />
        <span class="text-sm font-medium">@{{ item.name }}</span>
      </Button>
    </div>
  </ScrollArea>
</template>
