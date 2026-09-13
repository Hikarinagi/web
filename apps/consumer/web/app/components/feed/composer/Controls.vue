<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { ChevronUp, Trash2 } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'FeedComposerControls' })

  defineProps<{ expanded: boolean; hasContent: boolean }>()
  defineEmits<{ clear: []; collapse: []; 'switch-article': [] }>()
</script>

<template>
  <div class="flex min-h-9 shrink-0 items-center gap-1">
    <AnimatePresence>
      <motion.div
        v-if="expanded && hasContent"
        key="clear"
        :initial="{ width: 0, opacity: 0 }"
        :animate="{ width: 'auto', opacity: 1 }"
        :exit="{ width: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <Button
          v-tooltip.top="'清空草稿'"
          unstyled
          aria-label="清空草稿"
          class="grid size-8 cursor-pointer place-items-center rounded-md text-muted-color transition-colors hover:bg-surface-100 hover:text-red-500 dark:hover:bg-surface-800"
          @click.stop="$emit('clear')"
        >
          <template #icon>
            <Trash2 :size="17" />
          </template>
        </Button>
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="expanded"
        key="collapse"
        :initial="{ width: 0, opacity: 0 }"
        :animate="{ width: 'auto', opacity: 1 }"
        :exit="{ width: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <Button
          v-tooltip.top="'收起'"
          unstyled
          aria-label="收起"
          class="grid size-8 cursor-pointer place-items-center rounded-md text-muted-color transition-colors hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800"
          @click.stop="$emit('collapse')"
        >
          <template #icon>
            <ChevronUp :size="18" />
          </template>
        </Button>
      </motion.div>
    </AnimatePresence>

    <div class="flex items-center gap-0.5 rounded-lg bg-surface-100 p-0.5 dark:bg-surface-800">
      <span
        class="rounded-md bg-surface-0 px-3 py-1 text-xs font-bold text-color dark:bg-surface-900"
      >
        图文
      </span>
      <Button
        unstyled
        class="cursor-pointer rounded-md px-3 py-1 text-xs font-medium text-muted-color transition-colors hover:text-color"
        @mousedown.prevent
        @click.stop="$emit('switch-article')"
      >
        文章
      </Button>
    </div>
  </div>
</template>
