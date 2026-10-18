<script setup lang="ts">
  import { accountTheme } from '~/features/light-novel-reader/settings'
  import { shellStyle } from '~/features/light-novel-reader/themes'
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  definePageMeta({
    layout: 'reader',
    floatingToolbar: false,
    key: 'light-novel-reader',
  })

  const route = useRoute()
  const volumeId = computed(() =>
    Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id),
  )

  const { data, refresh } = await useHikariApiData(
    () => `/api/pages/light-novel-volumes/${volumeId.value}/reader` as const,
    { fatal: true },
  )
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)

  const auth = useAuthStore()
  watch(
    () => auth.isAuthenticated,
    authenticated => {
      if (authenticated && !data.value?.reader) void refresh()
    },
  )

  useHead({
    htmlAttrs: { class: 'overflow-hidden overscroll-none reader-touch' },
    style: [
      {
        key: 'light-novel-reader-theme',
        textContent: computed(() =>
          shellStyle(accountTheme(data.value?.reader?.settings.theme_index)),
        ),
      },
    ],
  })

  useHikariSeoMeta({
    title: () =>
      data.value
        ? `${getLightNovelTitle(data.value.light_novel)} ${getLightNovelVolumeTitle(data.value.volume)}`
        : undefined,
    noindex: true,
  })
</script>

<template>
  <LightNovelReaderRoot v-if="data" :data="data" />
</template>
