<script setup lang="ts">
  import { Hash } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { tagRoute } from '~/features/manga/explore'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'MangaAboutIntro' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    tags: MangaPageData['tags']
  }>()

  const showJp = ref(false)
  const primary = computed(() => props.manga.summary_cn || props.manga.summary)
  const jp = computed(() =>
    props.manga.summary_cn && props.manga.summary && props.manga.summary !== props.manga.summary_cn
      ? props.manga.summary
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
    <p v-else class="text-sm text-surface-500 dark:text-surface-400">还没有收录简介</p>

    <div v-if="jp" class="flex flex-col">
      <Button
        unstyled
        class="w-fit text-[13px] font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
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
            class="pt-3 text-[15px] leading-[26px] wrap-anywhere whitespace-pre-line text-surface-600 dark:text-surface-400"
          >
            {{ jp }}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>

    <div v-if="tags.length" class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="item in tags"
        :key="item.tag.id"
        :to="tagRoute(item.tag.id)"
        class="inline-flex items-center gap-1 rounded-full bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-700 transition-colors hover:bg-surface-200 focus-visible:ring-2 focus-visible:ring-surface-300 focus-visible:outline-none dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-700 dark:focus-visible:ring-surface-600"
      >
        <Hash class="size-[11px] text-surface-400" />
        {{ item.tag.name }}
      </NuxtLink>
    </div>
  </div>
</template>
