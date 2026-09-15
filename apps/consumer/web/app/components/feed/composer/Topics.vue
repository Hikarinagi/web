<script setup lang="ts">
  import { Chip, Inline } from '@hina-ui/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { Hash } from '@lucide/vue'
  import { TRANSITION } from '~/lib/motion'
  import type { ComposerTopic } from './composables/useComposer'
  import { useTopics, type TopicOption } from '~/components/topic/useTopics'

  defineOptions({ name: 'FeedComposerTopics' })

  const props = defineProps<{ show: boolean; topics: ComposerTopic[]; topicsFull: boolean }>()
  const emit = defineEmits<{
    add: [topic: ComposerTopic]
    remove: [id: number]
    create: [name: string]
  }>()

  const pickerOpen = ref(false)
  const { query, kw, busy, sections, canCreate, selectedIds, ensureLoaded } = useTopics({
    selected: () => props.topics,
    full: () => props.topicsFull,
  })

  watch(pickerOpen, open => {
    if (open) void ensureLoaded()
  })

  function pick(t: TopicOption) {
    if (selectedIds.value.has(t.id)) emit('remove', t.id)
    else if (!props.topicsFull) emit('add', { id: t.id, name: t.name })
  }
  function create() {
    if (!canCreate.value) return
    emit('create', kw.value)
    query.value = ''
  }
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="show"
      key="topics"
      :initial="{ height: 0, opacity: 0 }"
      :animate="{ height: 'auto', opacity: 1 }"
      :exit="{ height: 0, opacity: 0 }"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <Inline gap="sm" class="px-4 pt-1 pb-2 pl-16">
        <Chip v-for="t in topics" :key="t.id" size="sm" removable @remove="$emit('remove', t.id)">
          <template #icon><Hash /></template>
          {{ t.name }}
        </Chip>

        <TopicPicker
          v-if="!topicsFull"
          v-model:open="pickerOpen"
          v-model:query="query"
          :loading="busy"
          :sections="sections"
          :can-create="canCreate"
          :kw="kw"
          :selected="topics"
          :selected-ids="selectedIds"
          @pick="pick"
          @create="create"
          @remove="id => emit('remove', id)"
        >
          <Chip as="button" variant="outline" size="sm" class="border-dashed text-muted">
            <template #icon><Hash /></template>
            话题
          </Chip>
        </TopicPicker>
      </Inline>
    </motion.div>
  </AnimatePresence>
</template>
