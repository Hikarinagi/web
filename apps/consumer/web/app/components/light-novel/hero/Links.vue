<script setup lang="ts">
  import { BookOpen } from '@lucide/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
  }>()

  const bangumiUrl = computed(() =>
    props.lightNovel.bangumi_book_id
      ? `https://bgm.tv/subject/${props.lightNovel.bangumi_book_id}`
      : null,
  )
</script>

<template>
  <div class="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
    <Button as="a" href="#volumes" label="分卷列表" severity="primary">
      <template #icon>
        <BookOpen :size="16" aria-hidden="true" />
      </template>
    </Button>

    <WorkExternalButton provider="bangumi" :href="bangumiUrl" />
  </div>
</template>
