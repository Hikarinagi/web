<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { Hash, X } from '@lucide/vue'
  import type Popover from 'primevue/popover'
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

  const op = ref<InstanceType<typeof Popover>>()
  const { query, kw, busy, sections, canCreate, selectedIds, ensureLoaded } = useTopics({
    selected: () => props.topics,
    full: () => props.topicsFull,
  })

  function toggle(event: MouseEvent) {
    op.value?.toggle(event)
  }
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
      <div class="flex flex-wrap items-center gap-2 px-4 pt-1 pb-2 pl-16">
        <span
          v-for="t in topics"
          :key="t.id"
          class="inline-flex items-center gap-1 rounded-lg bg-surface-100 py-1 pr-1.5 pl-2.5 text-xs font-medium text-color dark:bg-surface-800"
        >
          <span class="text-primary-600">#</span>
          {{ t.name }}
          <Button
            unstyled
            aria-label="移除话题"
            class="grid size-4 cursor-pointer place-items-center rounded text-muted-color transition-colors hover:bg-surface-200 hover:text-color dark:hover:bg-surface-700"
            @click.stop="$emit('remove', t.id)"
          >
            <template #icon>
              <X :size="11" />
            </template>
          </Button>
        </span>
        <Button
          v-if="!topicsFull"
          label="话题"
          unstyled
          class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-surface-300 px-2.5 py-0.5 text-xs font-medium text-muted-color transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-600"
          @click.stop="toggle"
        >
          <template #icon>
            <Hash :size="12" />
          </template>
        </Button>
      </div>

      <Popover ref="op" :pt="{ root: { class: 'popover-no-arrow' } }" @show="ensureLoaded">
        <TopicPicker
          v-model:query="query"
          :loading="busy"
          :sections="sections"
          :can-create="canCreate"
          :kw="kw"
          :selected-ids="selectedIds"
          @pick="pick"
          @create="create"
        />
      </Popover>
    </motion.div>
  </AnimatePresence>
</template>
