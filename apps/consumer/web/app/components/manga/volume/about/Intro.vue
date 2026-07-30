<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'MangaVolumeAboutIntro' })
  const props = defineProps<{ volume: MangaVolumePageData['volume'] }>()

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
  <div class="min-w-0 flex-1">
    <p
      v-if="primary"
      class="text-sm leading-relaxed wrap-anywhere whitespace-pre-line text-surface-700 dark:text-surface-300"
    >
      {{ primary }}
    </p>
    <p v-else class="text-sm text-muted-color">这一卷还没有简介</p>

    <div v-if="jp" class="mt-2 flex flex-col">
      <Button
        unstyled
        class="w-fit cursor-pointer text-xs font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
        :aria-expanded="showJp"
        @click="showJp = !showJp"
      >
        {{ showJp ? '收起日文原文' : '展开日文原文' }}
      </Button>
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
            class="pt-2 text-sm leading-relaxed wrap-anywhere whitespace-pre-line text-surface-600 dark:text-surface-400"
          >
            {{ jp }}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  </div>
</template>
