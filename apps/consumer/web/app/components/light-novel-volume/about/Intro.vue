<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'LightNovelVolumeAboutIntro' })
  const props = defineProps<{ volume: LightNovelVolumePageData['volume'] }>()

  const showJp = ref(false)
  const primary = computed(() => props.volume.summary_cn || props.volume.summary)
  const jp = computed(() =>
    props.volume.summary_cn &&
    props.volume.summary &&
    props.volume.summary !== props.volume.summary_cn
      ? props.volume.summary
      : '',
  )
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col gap-5">
    <p
      v-if="primary"
      class="text-[15px] leading-[26px] wrap-anywhere whitespace-pre-line text-surface-700 dark:text-surface-300"
    >
      {{ primary }}
    </p>

    <div v-if="jp" class="flex flex-col">
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
            class="pt-3 text-[15px] leading-[26px] wrap-anywhere whitespace-pre-line text-surface-600 dark:text-surface-400"
          >
            {{ jp }}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
