<script setup lang="ts">
  import { Heading, Link, Stack } from '@hina-ui/vue'
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

  const resources = useTemplateRef('resources')
  const reducedMotion = usePreferredReducedMotion()

  onMounted(async () => {
    await nextTick()
    requestAnimationFrame(() => {
      unrefElement(resources)?.scrollIntoView({
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
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <GalgameHero
      :galgame="data.galgame"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :my-cover-vote="data.my_cover_vote"
      :favorited="data.favorite?.favorited ?? false"
    />

    <Stack
      ref="resources"
      gap="lg"
      class="mx-auto w-full max-w-app scroll-mt-(--app-header-height) px-6 py-10"
    >
      <NuxtLink v-slot="{ href, navigate }" :to="`/galgames/${galgameId}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-fg"
          @click="navigate"
        >
          <ArrowLeft class="size-3.5" />
          返回《{{ galgameName }}》的详情页
        </Link>
      </NuxtLink>

      <Heading :level="1" size="xl">{{ galgameName }} 资源下载</Heading>

      <GalgameDownloadsList :galgame-id="galgameId" :resources="data.resources" />

      <PromotionBanner v-if="data.banners[0]" :banner="data.banners[0]" />
    </Stack>
  </Stack>
</template>
