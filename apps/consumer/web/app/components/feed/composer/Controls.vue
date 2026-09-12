<script setup lang="ts">
  import { IconButton, Inline, SegmentedControl } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { ChevronUp, Trash2 } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { COMPOSER_KIND_OPTIONS } from './composables/useComposer'

  defineOptions({ name: 'FeedComposerControls' })

  defineProps<{ expanded: boolean; hasContent: boolean }>()
  const emit = defineEmits<{ clear: []; collapse: []; 'switch-article': [] }>()

  function onKind(value: string | number | undefined) {
    if (value === 'article') emit('switch-article')
  }
</script>

<template>
  <Inline gap="xs" :wrap="false" class="min-h-9 shrink-0">
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
        <IconButton label="清空草稿" tone="danger" size="sm" @click.stop="emit('clear')">
          <Trash2 />
        </IconButton>
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
        <IconButton label="收起" size="sm" @click.stop="emit('collapse')">
          <ChevronUp />
        </IconButton>
      </motion.div>
    </AnimatePresence>

    <SegmentedControl
      model-value="post"
      :options="COMPOSER_KIND_OPTIONS"
      size="sm"
      class="shrink-0"
      @mousedown.prevent
      @click.stop
      @update:model-value="onKind"
    />
  </Inline>
</template>
