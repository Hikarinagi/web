<script setup lang="ts">
  import { isAuthError, normalizeApiError, throwPageError } from '~/utils/api/error'

  definePageMeta({
    layout: 'reader',
    floatingToolbar: false,
    key: route => route.fullPath,
  })

  useHead({ htmlAttrs: { class: 'overflow-hidden overscroll-none' } })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const rawChapterId = Array.isArray(route.params.chapterId)
    ? route.params.chapterId[0]
    : route.params.chapterId
  const mangaId = Number(rawId)
  const chapterId = Number(rawChapterId)

  const { data, error, refresh } = await useHikariApiData(
    `/api/pages/mangas/reader/${mangaId}/${chapterId}`,
    { toast: false },
  )

  const gated = computed(() => !!error.value && isAuthError(normalizeApiError(error.value)))
  if (error.value && !gated.value) throwPageError(error.value)

  const auth = useAuthStore()
  watch(
    () => auth.isAuthenticated,
    authenticated => {
      if (authenticated && !data.value) void refresh()
    },
  )

  useNsfwDetailGate(() => data.value?.manifest.manga.nsfw)

  useHikariSeoMeta({
    title: () => {
      const pageData = data.value
      if (!pageData) return '在线阅读'
      const mangaTitle = pageData.manifest.manga.name_cn || pageData.manifest.manga.name
      const chapterNumber = pageData.manifest.chapter.chapter_number
      const chapterPart = chapterNumber
        ? `第 ${chapterNumber} 话`
        : pageData.manifest.chapter.name_cn || pageData.manifest.chapter.name || ''
      return [`${mangaTitle} ${chapterPart} 在线阅读`, `${mangaTitle} 在线阅读`]
    },
    noindex: true,
  })

  async function refreshData() {
    await refresh()
  }
</script>

<template>
  <MangaReader v-if="data" :data="data" :refresh-data="refreshData" />
  <MangaReaderLoginGate v-else-if="gated" :manga-id="mangaId" />
</template>
