<script setup lang="ts">
  import { BookUp } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaHeroContribute' })
  const props = defineProps<{
    mangaId: number
    title: string
    chapters: MangaPageData['chapters']
    finished: boolean
  }>()

  const open = ref(false)
  const next = computed(() => {
    const numbers = props.chapters
      .filter(chapter => chapter.chapter_type === 'SERIALIZATION')
      .map(chapter => Number(chapter.chapter_number))
      .filter(Number.isFinite)
    return numbers.length ? String(Math.floor(Math.max(...numbers)) + 1) : ''
  })
</script>

<template>
  <Button
    login-required
    variant="soft"
    tone="neutral"
    size="sm"
    class="self-center lg:self-start"
    @click="open = true"
  >
    <template #icon><BookUp /></template>
    {{ finished ? '投稿单行本' : '投稿章节' }}
  </Button>
  <ContributeMangaStartDialog
    v-model:open="open"
    :series="{ id: mangaId, title }"
    :scope="finished ? 'VOLUME' : 'CHAPTER'"
    :new-chapter="finished ? undefined : next"
  />
</template>
