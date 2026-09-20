<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION } from '~/lib/motion'
  import type { GalgameSummary } from '~/features/galgame/explore'
  import { titleOf } from '~/features/galgame/explore'
  import type { GalgameRateStatus } from '~/features/galgame/rate'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecordStep' })

  const props = defineProps<{
    selected: GalgameSummary
    loadingRate: boolean
    saving: boolean
  }>()
  const emit = defineEmits<{
    back: []
    submit: []
  }>()
  const status = defineModel<GalgameRateStatus>('status', { required: true })
  const score = defineModel<number>('score', { required: true })
  const content = defineModel<string>('content', { required: true })
  const spoiler = defineModel<boolean>('spoiler', { required: true })

  const selectedTitle = computed(() => titleOf(props.selected))
  const selectedCover = computed(() => topVotedMedia(props.selected.covers))
  const shouldRate = computed(() => status.value !== 'PLAN')
  const submitLabel = computed(() => {
    const map: Record<GalgameRateStatus, string> = {
      PLAN: '加入想玩',
      GOING: '记录在玩',
      COMPLETED: '记录通关',
      ON_HOLD: '标记搁置',
      DROPPED: '标记弃坑',
    }

    return map[status.value]
  })
</script>

<template>
  <div class="flex min-h-[420px] flex-col">
    <div class="flex flex-1 flex-col gap-5 px-6 py-5">
      <Button
        text
        severity="secondary"
        label="换一部"
        class="w-fit"
        :disabled="saving"
        @click="emit('back')"
      >
        <template #icon>
          <ArrowLeft class="size-4" aria-hidden="true" />
        </template>
      </Button>

      <div class="flex items-center gap-3 rounded-lg bg-surface-50 p-3 dark:bg-surface-900">
        <div
          class="h-20 w-15 shrink-0 overflow-hidden rounded-md border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
        >
          <HikariImage
            :src="selectedCover"
            :alt="selectedTitle"
            class="size-full"
            image-class="size-full object-cover object-top"
            :processing="{ width: 160, height: 216, fit: 'cover', quality: 82 }"
            :lazy="true"
            :skeleton="false"
          />
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <span class="truncate text-base font-bold text-surface-950 dark:text-surface-50">
            {{ selectedTitle }}
          </span>
          <span class="text-sm text-surface-500 dark:text-surface-400">
            {{ loadingRate ? '正在读取已有记录…' : '选择一个最贴近当前进度的状态' }}
          </span>
        </div>
      </div>

      <GalgameExploreRecordStatusPicker v-model="status" />

      <AnimatePresence :initial="false">
        <motion.div
          v-if="shouldRate"
          key="rate-fields"
          :initial="{ opacity: 0, height: 0 }"
          :animate="{ opacity: 1, height: 'auto' }"
          :exit="{ opacity: 0, height: 0 }"
          :transition="TRANSITION"
          class="-mx-4 overflow-hidden px-4"
        >
          <div class="flex flex-col gap-4 pt-1">
            <div class="flex flex-col gap-2">
              <div class="flex items-center justify-between">
                <span class="text-sm font-semibold text-surface-800 dark:text-surface-100">
                  总分
                </span>
                <span
                  class="rounded-md bg-primary-50 px-2.5 py-1 text-sm font-semibold text-primary tabular-nums dark:bg-primary-950/40"
                >
                  {{ score.toFixed(1) }}
                </span>
              </div>
              <Slider v-model="score" :min="1" :max="10" :step="1" />
              <div class="flex items-center justify-between text-[11px] text-surface-400">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            <div class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-surface-800 dark:text-surface-100">
                一句话短评
              </span>
              <Textarea
                v-model="content"
                rows="3"
                fluid
                auto-resize
                maxlength="2000"
                placeholder="哪里打动你，或者哪里劝退你？一句话也行。"
              />
            </div>

            <label
              class="flex w-fit cursor-pointer items-center gap-2.5 text-sm text-surface-600 dark:text-surface-300"
            >
              <Checkbox v-model="spoiler" binary />
              包含剧透
            </label>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>

    <div
      class="flex items-center gap-3 border-t border-surface-100 px-6 py-4 dark:border-surface-800"
    >
      <span class="min-w-0 flex-1 text-xs text-surface-500 dark:text-surface-400">
        {{ shouldRate ? '之后可以在作品页继续补充维度评分。' : '想玩状态不会要求打分。' }}
      </span>
      <Button
        :label="submitLabel"
        :loading="saving"
        :disabled="loadingRate"
        @click="emit('submit')"
      />
    </div>
  </div>
</template>
