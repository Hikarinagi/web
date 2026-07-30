<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION } from '~/lib/motion'
  import { useExploreRecordDialog } from '~/features/galgame/useExploreRecordDialog'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameExploreRecordDialog' })

  const visible = defineModel<boolean>('visible', { required: true })
  const {
    step,
    query,
    results,
    selected,
    status,
    score,
    content,
    spoiler,
    searching,
    searched,
    loadingRate,
    saving,
    selectedTitle,
    doneRoute,
    selectWork,
    submit,
    backToSearch,
    again,
  } = useExploreRecordDialog(visible)
  const contentRef = ref<HTMLElement | null>(null)
  const contentHeight = ref(420)
  const contentAnimate = computed(() => ({ height: `${contentHeight.value}px` }))
  const activeStepNumber = computed(() => {
    if (step.value === 'done') return 3
    if (step.value === 'record') return 2
    return 1
  })

  useResizeObserver(contentRef, entries => {
    const height = entries[0]?.contentRect.height
    if (height) contentHeight.value = height
  })

  watch(visible, next => {
    if (next) contentHeight.value = 420
  })
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :dismissable-mask="!saving"
    :close-on-escape="!saving"
    :style="{ width: '92vw', maxWidth: '640px' }"
    :pt="{ content: { class: 'px-0! pb-0!' } }"
  >
    <template #header>
      <span class="text-[17px] font-bold text-color">记录进度</span>
    </template>

    <div class="flex flex-col">
      <div class="border-b border-surface-100 px-6 dark:border-surface-800">
        <div class="grid grid-cols-3 gap-2 text-xs font-medium">
          <span
            v-for="index in 3"
            :key="index"
            :class="
              cn(
                'h-1 rounded-full transition-colors',
                index <= activeStepNumber ? 'bg-primary' : 'bg-surface-200 dark:bg-surface-800',
              )
            "
          />
        </div>
      </div>

      <motion.div class="overflow-hidden" :animate="contentAnimate" :transition="TRANSITION">
        <div ref="contentRef">
          <AnimatePresence mode="wait" :initial="false">
            <motion.div
              v-if="step === 'search'"
              key="search"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="TRANSITION"
            >
              <GalgameExploreRecordSearchStep
                v-model:query="query"
                :results="results"
                :selected-id="selected?.id"
                :searching="searching"
                :searched="searched"
                @select="selectWork"
              />
            </motion.div>

            <motion.div
              v-else-if="step === 'record' && selected"
              key="record"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="TRANSITION"
            >
              <GalgameExploreRecordStep
                v-model:status="status"
                v-model:score="score"
                v-model:content="content"
                v-model:spoiler="spoiler"
                :selected="selected"
                :loading-rate="loadingRate"
                :saving="saving"
                @back="backToSearch"
                @submit="submit"
              />
            </motion.div>

            <motion.div
              v-else
              key="done"
              :initial="{ opacity: 0 }"
              :animate="{ opacity: 1 }"
              :exit="{ opacity: 0 }"
              :transition="TRANSITION"
            >
              <GalgameExploreRecordDoneStep
                :selected-title="selectedTitle"
                :status="status"
                :done-route="doneRoute"
                @again="again"
                @close="visible = false"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  </Dialog>
</template>
