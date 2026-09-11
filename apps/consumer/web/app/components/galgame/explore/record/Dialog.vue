<script setup lang="ts">
  import { Button, Dialog, Progress, Stack, Text } from '@hina-ui/vue'
  import { RotateCcw } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { NuxtLink } from '#components'
  import { TRANSITION } from '~/lib/motion'
  import type { GalgameRateStatus } from '~/features/galgame/rate'
  import { useExploreRecordDialog } from '~/features/galgame/useExploreRecordDialog'

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

  const SUBMIT_LABEL: Record<GalgameRateStatus, string> = {
    PLAN: '加入想玩',
    GOING: '记录在玩',
    COMPLETED: '记录通关',
    ON_HOLD: '标记搁置',
    DROPPED: '标记弃坑',
  }

  const contentRef = ref<HTMLElement | null>(null)
  const contentHeight = ref(420)
  const contentAnimate = computed(() => ({ height: `${contentHeight.value}px` }))
  const activeStepNumber = computed(() => {
    if (step.value === 'done') return 3
    if (step.value === 'record') return 2
    return 1
  })
  const stepProgressLabel = computed(() => {
    if (activeStepNumber.value === 1) return '选择作品'
    if (activeStepNumber.value === 2) return '记录状态'
    return '完成'
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
  <Dialog v-model:open="visible" title="记录状态" size="xl" :locked="saving">
    <template #content>
      <Stack gap="md">
        <Progress :value="activeStepNumber" :max="3" size="sm" :label="stepProgressLabel" />

        <motion.div
          class="-mx-3 overflow-hidden px-3"
          :animate="contentAnimate"
          :transition="TRANSITION"
        >
          <div ref="contentRef" class="py-1">
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
                <GalgameExploreRecordDoneStep :selected-title="selectedTitle" :status="status" />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </Stack>
    </template>

    <template v-if="step !== 'search'" #footer>
      <template v-if="step === 'record'">
        <Text size="xs" tone="muted" class="min-w-0 flex-1 self-center text-start">
          稍后可在作品页继续补充维度评分
        </Text>
        <Button :loading="saving" :disabled="loadingRate" @click="submit">
          {{ SUBMIT_LABEL[status] }}
        </Button>
      </template>
      <template v-else>
        <Button variant="outline" tone="neutral" @click="again">
          <template #icon><RotateCcw /></template>
          继续记录
        </Button>
        <Button :as="NuxtLink" :to="doneRoute" @click="visible = false">查看作品</Button>
      </template>
    </template>
  </Dialog>
</template>
