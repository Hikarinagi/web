<script setup lang="ts">
  import { ArrowLeft } from '@lucide/vue'
  import { galgameDownloadSeo } from '~/features/seo/galgame-download'

  definePageMeta({ container: 'full', scrollToTop: false })

  const route = useRoute()
  const galgameId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}/downloads`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)

  const galgameName = computed(() => {
    const g = data.value?.galgame
    return g?.trans_title || g?.origin_title || ''
  })

  const seo = computed(() => (data.value ? galgameDownloadSeo(data.value) : null))

  const resources = useTemplateRef<HTMLElement>('resources')
  const reducedMotion = usePreferredReducedMotion()

  onMounted(async () => {
    await nextTick()
    requestAnimationFrame(() => {
      resources.value?.scrollIntoView({
        behavior: reducedMotion.value === 'reduce' ? 'auto' : 'smooth',
        block: 'start',
      })
    })
  })

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '资源下载',
    headerTitle: () => seo.value?.headerTitle ?? '资源下载',
    description: () => seo.value?.description,
    card: { type: 'galgame', id: galgameId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <GalgameHero
      :galgame="data.galgame"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
    />

    <div
      ref="resources"
      class="mx-auto flex max-w-app scroll-mt-(--app-header-height) flex-col gap-6 px-6 py-10"
    >
      <NuxtLink
        :to="`/galgames/${galgameId}`"
        class="inline-flex w-fit items-center gap-1.5 text-sm text-muted-color transition-colors hover:text-color"
      >
        <ArrowLeft class="size-3.5" />
        返回《{{ galgameName }}》的详情页
      </NuxtLink>

      <h1 class="text-xl font-semibold text-color">{{ galgameName }} 资源下载</h1>

      <GalgameDownloadsList :galgame-id="galgameId" :resources="data.resources" />

      <PromotionBanner v-if="data.banners[0]" :banner="data.banners[0]" />
    </div>
  </div>
</template>
