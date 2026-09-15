<script setup lang="ts">
  import { Chip, Inline, Text } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { BookMarked } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import { RESOURCE_TYPE_ICON } from '~/features/creator/labels'
  import type { ComposerWork } from './composables/useComposer'

  defineOptions({ name: 'FeedComposerRelatedWorks' })

  defineProps<{ show: boolean; works: ComposerWork[]; full: boolean }>()
  const emit = defineEmits<{ add: [work: ComposerWork]; remove: [work: ComposerWork] }>()

  const pickerOpen = ref(false)

  const typeLabel = (work: ComposerWork) =>
    work.work_type === 'GALGAME' ? 'Galgame' : work.work_type === 'LIGHT_NOVEL' ? '轻小说' : '漫画'
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="related-works"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <Inline gap="sm" class="px-4 pt-1 pb-2 pl-16">
        <Chip
          v-for="work in works"
          :key="`${work.work_type}:${work.id}`"
          size="sm"
          removable
          :aria-label="`${typeLabel(work)}：${work.title}`"
          @remove="emit('remove', work)"
        >
          <template #icon>
            <component :is="RESOURCE_TYPE_ICON[work.work_type]" />
          </template>
          <Text as="span" size="xs" truncate>{{ work.title }}</Text>
        </Chip>

        <FeedComposerRelatedWorksPicker
          v-if="!full"
          v-model:open="pickerOpen"
          :selected="works"
          @add="work => emit('add', work)"
          @remove="work => emit('remove', work)"
        >
          <Chip as="button" variant="outline" size="sm" class="border-dashed text-muted">
            <template #icon><BookMarked /></template>
            关联作品
          </Chip>
        </FeedComposerRelatedWorksPicker>
      </Inline>
    </motion.div>
  </AnimatePresence>
</template>
