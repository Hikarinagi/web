<script setup lang="ts">
  import type { Component } from 'vue'
  import { cn } from '~/utils/cn'

  /**
   * Where a hint card sits once there is room to lay them out around the
   * reading surface. Below `sm` every card stacks in source order instead.
   */
  export type ReaderEducationPlacement = 'left' | 'right' | 'top' | 'center'

  export interface ReaderEducationHint {
    key: string
    placement: ReaderEducationPlacement
    title: string
    description?: string
    icon?: Component
  }

  defineOptions({ name: 'ReaderEducationOverlay' })

  withDefaults(
    defineProps<{
      hints: readonly ReaderEducationHint[]
      confirmLabel?: string
    }>(),
    { confirmLabel: '知道了，开始阅读' },
  )

  const emit = defineEmits<{ dismiss: [] }>()

  const PLACEMENT_CLASS: Record<ReaderEducationPlacement, string> = {
    left: 'sm:absolute sm:top-1/2 sm:left-[8%] sm:-translate-y-1/2',
    right: 'sm:absolute sm:top-1/2 sm:right-[8%] sm:-translate-y-1/2',
    top: 'sm:absolute sm:top-[14%] sm:left-1/2 sm:w-72 sm:-translate-x-1/2',
    center: 'sm:absolute sm:top-[38%] sm:left-1/2 sm:w-72 sm:-translate-x-1/2 sm:-translate-y-1/2',
  }
</script>

<template>
  <div class="absolute inset-0 z-50 overflow-y-auto bg-black/72">
    <div
      class="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-10 sm:relative sm:block sm:h-full sm:min-h-0 sm:p-0"
    >
      <div
        v-for="hint in hints"
        :key="hint.key"
        :class="
          cn(
            'flex w-60 flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-[#0a0d12]/92 px-6 py-5 text-center',
            PLACEMENT_CLASS[hint.placement],
          )
        "
      >
        <component :is="hint.icon" v-if="hint.icon" :size="22" class="text-primary" aria-hidden />
        <p class="text-sm font-semibold text-white">{{ hint.title }}</p>
        <p v-if="hint.description" class="text-xs text-[#8b95a6]">{{ hint.description }}</p>
      </div>

      <div class="sm:absolute sm:bottom-[16%] sm:left-1/2 sm:-translate-x-1/2">
        <Button rounded :label="confirmLabel" @click="emit('dismiss')" />
      </div>
    </div>
  </div>
</template>
