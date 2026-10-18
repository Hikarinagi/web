<script setup lang="ts">
  import { Button } from '@hina-ui/vue'
  import { Undo2 } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderStageReturn' })

  const { jumps, search, shell } = useReader()
  const { target } = jumps
  const { pinned } = search
  const lifted = computed(() => shell.chrome.value && shell.dock.value > 0)
</script>

<template>
  <Transition
    enter-active-class="hn-transition ease-(--hn-ease-enter)"
    leave-active-class="hn-transition ease-(--hn-ease-exit)"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <Button
      v-if="target"
      data-tour="return"
      variant="soft"
      tone="neutral"
      size="sm"
      pill
      :class="
        cn(
          'absolute bottom-6 left-1/2 z-10 -translate-x-1/2 shadow-md transition-[bottom] duration-200 ease-(--hn-ease-enter)',
          pinned && 'bottom-[calc(max(--spacing(4),env(safe-area-inset-bottom))+--spacing(16))]',
          lifted && 'bottom-[calc(var(--reader-dock)+--spacing(3))]',
          lifted && pinned && 'bottom-[calc(var(--reader-dock)+--spacing(19))]',
        )
      "
      @click="jumps.back()"
    >
      <template #icon><Undo2 aria-hidden="true" /></template>
      {{ target.page == null ? '返回原位置' : `返回第 ${target.page} 页` }}
    </Button>
  </Transition>
</template>
