<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'EntityIntro' })
  const props = defineProps<{ text?: string | null; original?: string | null }>()
  const isEmpty = computed(() => !props.text || ['暂无', '暂無'].includes(props.text.trim()))
  const showJp = ref(false)
</script>

<template>
  <div class="min-w-0 flex-1">
    <p
      v-if="!isEmpty"
      class="text-[15px] leading-[1.75] whitespace-pre-line text-surface-700 dark:text-surface-300"
    >
      {{ text }}
    </p>
    <p v-else class="text-[15px] text-surface-500 dark:text-surface-400">暂无简介</p>

    <div v-if="!isEmpty && original" class="mt-5 flex flex-col">
      <button
        type="button"
        class="w-fit text-[13px] font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
        :aria-expanded="showJp"
        @click="showJp = !showJp"
      >
        {{ showJp ? '收起日文原文' : '展开日文原文' }}
      </button>
      <AnimatePresence>
        <motion.div
          v-if="showJp"
          key="jp"
          :initial="{ height: 0, opacity: 0 }"
          :animate="{ height: 'auto', opacity: 1 }"
          :exit="{ height: 0, opacity: 0 }"
          :transition="TRANSITION"
          class="overflow-hidden"
        >
          <p
            class="pt-3 text-[15px] leading-[1.75] wrap-anywhere whitespace-pre-line text-surface-600 dark:text-surface-400"
          >
            {{ original }}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
