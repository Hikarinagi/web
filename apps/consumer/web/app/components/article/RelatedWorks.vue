<script setup lang="ts">
  import { workPath } from '#shared/utils/work'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  type Work = ArticlePageData['article']['related_works'][number]

  const props = defineProps<{ works: Work[] }>()

  const to = (w: Work) => workPath(w.work_type, w.id)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const visibleWorks = computed(() => props.works.filter(work => !shouldBlockNsfw(work.nsfw)))
</script>

<template>
  <div v-if="visibleWorks.length" class="flex flex-col gap-2">
    <span class="text-xs text-muted-color">聊到了这些作品</span>
    <div class="flex flex-wrap gap-2">
      <NuxtLink
        v-for="w in visibleWorks"
        :key="`${w.work_type}:${w.id}`"
        :to="to(w)"
        class="inline-flex items-center gap-2 rounded-lg border border-surface-200 bg-surface-0 py-1 pr-3 pl-1 transition-colors hover:border-surface-300 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700"
      >
        <HikariImage
          :src="w.cover"
          :alt="w.title"
          class="size-7 shrink-0 overflow-hidden rounded"
          image-class="size-full object-cover"
          :processing="{ q: 80 }"
        />
        <span class="text-[13px] font-medium text-color">{{ w.title }}</span>
      </NuxtLink>
    </div>
  </div>
</template>
