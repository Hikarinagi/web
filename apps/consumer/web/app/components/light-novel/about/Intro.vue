<script setup lang="ts">
  import { Hash } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { tagRoute } from '~/features/light-novel/explore'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'LightNovelAboutIntro' })
  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    tags: LightNovelPageData['tags']
  }>()

  const showJp = ref(false)
  const primary = computed(() => props.lightNovel.summary_cn || props.lightNovel.summary)
  const jp = computed(() =>
    props.lightNovel.summary_cn &&
    props.lightNovel.summary &&
    props.lightNovel.summary !== props.lightNovel.summary_cn
      ? props.lightNovel.summary
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

    <div v-if="tags.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="t in tags"
        :key="t.tag.id"
        :to="tagRoute(t.tag.id)"
        class="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-surface-300 focus-visible:outline-none dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 dark:focus-visible:ring-surface-600"
      >
        <Hash class="size-[11px] text-surface-400" />
        {{ t.tag.name }}
      </NuxtLink>
    </div>
  </div>
</template>
