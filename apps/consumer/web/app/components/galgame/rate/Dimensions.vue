<script setup lang="ts">
  import { ChevronDown } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { GALGAME_RATE_DIMENSIONS } from '~/features/galgame/rate'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'GalgameRateDimensions' })

  const open = defineModel<boolean>('open', { required: true })
</script>

<template>
  <div class="flex flex-col">
    <div class="h-px w-full bg-surface-100 dark:bg-surface-800" />
    <button
      type="button"
      class="group mt-3 flex w-full cursor-pointer items-center gap-2 bg-transparent p-0"
      :aria-expanded="open"
      @click="open = !open"
    >
      <span
        class="text-[13px] font-medium text-surface-700 transition-colors group-hover:text-surface-900 dark:text-surface-300 dark:group-hover:text-surface-100"
      >
        更详细评分
      </span>
      <span class="text-[11px] text-surface-400">每项 1-10,可跳过</span>
      <span class="flex-1" />
      <motion.span
        :animate="{ rotate: open ? 180 : 0 }"
        :transition="TRANSITION"
        class="inline-flex"
      >
        <ChevronDown
          class="size-3.5 text-surface-400 transition-colors group-hover:text-surface-700 dark:group-hover:text-surface-200"
        />
      </motion.span>
    </button>

    <AnimatePresence>
      <motion.div
        v-if="open"
        key="dims"
        :initial="{ height: 0, opacity: 0 }"
        :animate="{ height: 'auto', opacity: 1 }"
        :exit="{ height: 0, opacity: 0 }"
        :transition="TRANSITION"
        class="overflow-hidden"
      >
        <div class="flex flex-col gap-3 pt-3">
          <FormItem
            v-for="d in GALGAME_RATE_DIMENSIONS"
            :key="d.key"
            v-slot="{ field }"
            :name="d.key"
          >
            <div class="flex items-center gap-3">
              <span class="w-12 shrink-0 text-[13px] text-surface-700 dark:text-surface-300">
                {{ d.label }}
              </span>
              <Slider
                :model-value="field.value ?? 0"
                :min="1"
                :max="10"
                :step="1"
                class="min-w-0 flex-1"
                @update:model-value="
                  value => field.props.onInput({ value: (value as number) === 0 ? null : value })
                "
              />
              <span
                class="w-6 text-right text-sm font-semibold tabular-nums"
                :class="field.value == null ? 'text-surface-400' : 'text-color'"
              >
                {{ field.value ?? '—' }}
              </span>
            </div>
          </FormItem>
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
