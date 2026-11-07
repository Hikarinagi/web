<script setup lang="ts">
  import { Lightbox, Stack, type LightboxItem } from '@hina-ui/vue'
  import { resolveImageUrl } from '@hikarinagi/config'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { blurUrl } from '~/features/entry/tone'
  import { useActiveSection } from '~/features/entry/useActiveSection'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { tagRoute } from '~/features/galgame/explore'
  import { langLabel } from '~/features/galgame/labels'
  import { GALGAME_STATUS_LABEL, type GalgameRateStatus } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import { getGalgameCover } from '~/utils/media/galgame'
  import type { EntryRating } from '~/components/entry/RatingCard.vue'
  import type { EntryReview } from '~/components/entry/Reviews.vue'

  defineOptions({ name: 'GalgamePage' })
  const props = defineProps<{ data: GalgamePageData; galgameId: number; embedded?: boolean }>()

  const config = useRuntimeConfig()
  const title = computed(() => props.data.display.title || `Galgame #${props.data.galgame.id}`)
  const images = computed(() => props.data.galgame.images.filter(image => image.src.trim()))
  const cover = computed(() => getGalgameCover(props.data.galgame))

  const index = ref(0)
  const hash = computed(
    () => images.value[index.value]?.thumb_hash ?? cover.value?.thumb_hash ?? null,
  )
  const glow = computed(() => blurUrl(hash.value))
  usePageTone(hash, { enabled: !props.embedded })

  const values = (property: string) =>
    props.data.facts.find(fact => fact.property === property)?.values ?? []
  const website = computed(() => values('WEBSITE')[0]?.text)
  const languages = computed(() => [
    ...new Set(
      [
        ...values('LANGUAGE').map(value => value.code ?? value.text),
        ...props.data.products.flatMap(product => product.languages),
      ].map(langLabel),
    ),
  ])
  const external = computed(() =>
    values('EXTERNAL_LINK').flatMap(value =>
      value.code === 'VNDB'
        ? [{ label: 'VNDB', href: `https://vndb.org/${value.text}` }]
        : value.code === 'BANGUMI'
          ? [{ label: 'Bangumi', href: `https://bgm.tv/subject/${value.text}` }]
          : [],
    ),
  )
  const tags = computed(() =>
    props.data.tags.map(item => ({
      id: item.tag.id,
      name: item.tag.name,
      to: tagRoute(item.tag.id),
    })),
  )

  const rating = computed<EntryRating>(() => {
    const stats = props.data.rate_stats
    const scores = stats.dimension_averages
    return {
      average: stats.average,
      rated: stats.rated_count,
      distribution: stats.distribution,
      dimensions: [
        { label: '剧情', value: scores.scenario },
        { label: '角色', value: scores.character },
        { label: '画面', value: scores.visual },
        { label: '音乐', value: scores.music },
        { label: '演出', value: scores.direction },
        { label: '系统', value: scores.system },
      ],
      statuses: [
        { label: '想玩', count: stats.status_counts.plan },
        { label: '在玩', count: stats.status_counts.going },
        { label: '玩过', count: stats.status_counts.completed },
        { label: '搁置', count: stats.status_counts.on_hold },
        { label: '弃坑', count: stats.status_counts.dropped },
      ],
    }
  })
  const reviews = computed<EntryReview[]>(() =>
    props.data.top_rates.items.map(item => ({
      id: item.id,
      score: item.rate,
      text: item.rate_content,
      spoiler: item.is_spoiler,
      rater: item.rater,
      status: item.status ? GALGAME_STATUS_LABEL[item.status as GalgameRateStatus] : undefined,
      hours: item.time_to_finish_minutes ? Math.round(item.time_to_finish_minutes / 60) : undefined,
      likes: item.like_count,
      date: item.created_at.slice(0, 10),
    })),
  )

  const sections = computed(() =>
    [
      { id: 'intro', label: '简介', shown: true },
      { id: 'cast', label: '角色', shown: props.data.characters.length > 0 },
      { id: 'reviews', label: '短评', shown: true },
      { id: 'releases', label: '版本', shown: true },
      {
        id: 'credits',
        label: '制作',
        shown: props.data.credits.groups.length > 0 || props.data.credits.translators.length > 0,
      },
      { id: 'related', label: '相关', shown: props.data.relations.length > 0 },
    ].filter(section => section.shown),
  )
  const { active, go } = useActiveSection(() => sections.value.map(section => section.id))

  const stage = useTemplateRef<HTMLElement>('stage')
  const { bottom } = useElementBounding(stage)
  const pinned = computed(() => !props.embedded && bottom.value < 64 && bottom.value !== 0)

  const rateCtl = useGalgameRate(props.galgameId, props.data.my_rate)
  const rateOpen = ref(false)

  const galleryLoaded = ref(false)
  const galleryOpen = ref(false)
  const galleryAt = ref(0)
  const url = (src: string) =>
    resolveImageUrl(src, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    })
  const galleryItems = computed<LightboxItem[]>(() => [
    ...images.value.map(image => ({
      id: String(image.id),
      src: url(image.src),
      alt: title.value,
    })),
    ...(cover.value
      ? [{ id: 'cover', src: url(cover.value.src), alt: `${title.value} 封面` }]
      : []),
  ])
  function gallery(at: number) {
    galleryAt.value = at
    galleryLoaded.value = true
    galleryOpen.value = true
  }
</script>

<template>
  <Stack gap="none" class="min-h-screen bg-canvas transition-colors duration-700">
    <Stack ref="stage" gap="none">
      <GalgameStage
        v-model:index="index"
        :data="data"
        :title="title"
        :website="website"
        :languages="languages"
        @gallery="gallery"
        @cover="gallery(images.length)"
        @rate="rateOpen = true"
      />
    </Stack>
    <GalgameStickyBar
      :data="data"
      :title="title"
      :shown="pinned"
      :sections="sections"
      :active="active"
      @go="go"
    />

    <Stack gap="none" class="relative isolate">
      <Stack
        gap="none"
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-(--ambient-height) mask-t-from-70% mask-b-from-10% bg-cover bg-center opacity-40 dark:flex"
        :style="{ backgroundImage: glow ? `url(${glow})` : undefined }"
      />
      <Stack
        gap="none"
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-(--ambient-height) bg-linear-to-b from-(--tone-soft) to-transparent dark:hidden"
      />
      <Stack
        gap="xl"
        class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:grid lg:grid-cols-[var(--rail-left)_minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6 lg:py-10"
      >
        <Stack as="aside" gap="xl" class="order-last lg:order-first">
          <GalgameFacts :data="data" :website="website" :languages="languages" />
          <EntryTags :tags="tags" />
          <GalgameBrandWorks
            v-if="data.brand_works"
            :works="data.brand_works"
            :current="galgameId"
          />
          <EntryMeta
            :contributors="data.contributors"
            resource-type="galgame"
            :resource-id="galgameId"
            :updated-at="data.galgame.revised_at ?? data.galgame.created_at"
            :external="external"
            :views="data.galgame.views"
          />
        </Stack>
        <Stack gap="none" class="min-w-0 gap-12">
          <Stack gap="md"
            ><GalgameIntro :galgame="data.galgame" :intros="data.display.intros"
          /></Stack>
          <Stack gap="md" class="lg:hidden"><EntryRatingCard :rating="rating" /></Stack>
          <Stack v-if="data.characters.length" gap="md">
            <GalgameCast :characters="data.characters" />
          </Stack>
          <Stack gap="md">
            <EntryReviews
              :reviews="reviews"
              :count="data.rate_stats.content_count"
              :to="`/galgames/${galgameId}/rates`"
              @write="rateOpen = true"
            />
          </Stack>
          <WorkLongReviews :articles="data.articles" />
          <Stack gap="md"><GalgameProducts :products="data.products" /></Stack>
          <Stack gap="md"><GalgameCrew :credits="data.credits" /></Stack>
          <Stack gap="md"><GalgameRelations :relations="data.relations" /></Stack>
        </Stack>
        <Stack gap="md" class="hidden lg:sticky lg:top-(--sticky-top) lg:flex">
          <EntryRatingCard :rating="rating" />
          <GalgameResources :galgame-id="galgameId" :count="data.galgame.download_resource_count" />
        </Stack>
      </Stack>
    </Stack>

    <GalgameRateDialog
      v-model:visible="rateOpen"
      :galgame-id="galgameId"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
    <Lightbox
      v-if="galleryLoaded"
      v-model:open="galleryOpen"
      v-model:index="galleryAt"
      :items="galleryItems"
    />
  </Stack>
</template>
