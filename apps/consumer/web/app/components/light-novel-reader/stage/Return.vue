<script setup lang="ts">
  import { Button, Center } from '@hina-ui/vue'
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
  <Center
    :class="
      cn(
        'pointer-events-none absolute inset-x-0 bottom-6 z-10 transition-[bottom] duration-200 ease-(--hn-ease-enter)',
        pinned && 'bottom-[calc(max(--spacing(4),env(safe-area-inset-bottom))+--spacing(16))]',
        lifted && 'bottom-[calc(var(--reader-dock)+--spacing(3))]',
        lifted && pinned && 'bottom-[calc(var(--reader-dock)+--spacing(19))]',
      )
    "
  >
    <Transition
      enter-active-class="hn-transition-base"
      leave-active-class="hn-transition"
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
        class="pointer-events-auto shadow-md"
        @click="jumps.back()"
      >
        <template #icon><Undo2 aria-hidden="true" /></template>
        {{ target.page == null ? '返回原位置' : `返回第 ${target.page} 页` }}
      </Button>
    </Transition>
  </Center>
</template>
