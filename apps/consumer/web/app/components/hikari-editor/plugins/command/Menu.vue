<script setup lang="ts">
  import type { CommandMenuItem } from './types'

  const props = defineProps<{
    items: CommandMenuItem[]
    query: string
    command: (item: CommandMenuItem) => void
  }>()

  const activeIndex = ref(0)
  const scrollArea = useTemplateRef<{ viewport: HTMLElement | null }>('scrollArea')

  watch(
    () => props.items,
    () => {
      activeIndex.value = 0
      scrollActive()
    },
  )

  watch(activeIndex, scrollActive)

  function scrollActive() {
    nextTick(() => {
      const viewport = scrollArea.value?.viewport
      if (!viewport) return

      const target = scrollArea.value?.viewport?.querySelector(
        `[data-command-index="${activeIndex.value}"]`,
      )
      if (!(target instanceof HTMLElement)) return

      const viewportRect = viewport.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const top = targetRect.top - viewportRect.top + viewport.scrollTop
      const bottom = top + target.offsetHeight
      const padding = 4

      if (top < viewport.scrollTop + padding) {
        viewport.scrollTo({ top: Math.floor(top - padding) })
      } else if (bottom > viewport.scrollTop + viewport.clientHeight - padding) {
        viewport.scrollTo({ top: Math.ceil(bottom - viewport.clientHeight + padding) })
      }
    })
  }

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
  <div>
    <ScrollArea
      ref="scrollArea"
      class="max-h-80 w-80 rounded-lg border border-surface-200 bg-surface-0 shadow-lg dark:border-surface-700 dark:bg-surface-900"
    >
      <div v-if="!items.length" class="px-3 py-4 text-center text-sm text-muted-color">
        {{ query ? '没有匹配命令' : '输入命令名称' }}
      </div>

      <div v-else class="flex flex-col gap-0.5 p-1">
        <Button
          v-for="(item, idx) in items"
          :key="item.id"
          unstyled
          type="button"
          :data-command-index="idx"
          :class="[
            'flex min-w-0 items-center gap-2.5 overflow-hidden rounded px-2.5 py-2 text-left',
            idx === activeIndex
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
              : 'text-color hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
          @mousedown.prevent
          @click="selectItem(idx)"
          @mouseenter="activeIndex = idx"
        >
          <span
            class="grid size-8 shrink-0 place-items-center rounded-md bg-surface-100 text-muted-color dark:bg-surface-800"
            :class="idx === activeIndex ? 'text-primary-600 dark:text-primary-300' : ''"
          >
            <component :is="item.icon" class="size-4" />
          </span>
          <span class="min-w-0 flex-1">
            <span class="flex min-w-0 items-center gap-2">
              <span class="min-w-0 flex-1 truncate text-sm font-medium">{{ item.label }}</span>
              <span
                class="shrink-0 font-mono text-[11px] leading-4 text-muted-color"
                :class="idx === activeIndex ? 'text-primary-500 dark:text-primary-300' : ''"
              >
                {{ item.command }}
              </span>
            </span>
            <span class="block truncate text-xs text-muted-color">{{ item.description }}</span>
          </span>
        </Button>
      </div>
    </ScrollArea>
  </div>
</template>
