<script setup lang="ts">
  import { Lightbox, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { gameRating } from '~/features/entry/rating'
  import { blurUrl, stageTone } from '~/features/entry/tone'
  import { useActiveSection } from '~/features/entry/useActiveSection'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { nearbyBrandWorks } from '~/features/galgame/brand'
  import { tagRoute } from '~/features/galgame/explore'
  import { langLabel } from '~/features/galgame/labels'
  import { GALGAME_STATUS_LABEL, type GalgameRateStatus } from '~/features/galgame/rate'
  import { useGalgameRate } from '~/features/galgame/useGalgameRate'
  import { useGalgameCover } from '~/features/galgame/useCoverVote'
  import { useGallery } from '~/features/galgame/useGallery'
  import type { EntryReview } from '~/components/entry/Reviews.vue'

  defineOptions({ name: 'GalgamePage' })
  const props = withDefaults(
    defineProps<{
      data: GalgamePageData
      galgameId: number
      embedded?: boolean
      tone?: 'page' | 'scope'
    }>(),
    { tone: 'page' },
  )

  const title = computed(() => props.data.display.title || `Galgame #${props.data.galgame.id}`)
  const images = computed(() => props.data.galgame.images.filter(image => image.src.trim()))
  const cover = useGalgameCover(() => props.data.galgame)

  const index = ref(0)
  const hash = computed(
    () => images.value[index.value]?.thumb_hash ?? cover.value?.thumb_hash ?? null,
  )
  const glow = computed(() => blurUrl(hash.value))
  usePageTone(hash, { enabled: props.tone === 'page' })
  const scope = computed(() => (props.tone === 'scope' ? stageTone(hash.value) : undefined))

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
  const cast = computed(() =>
    props.data.characters.map(item => ({
      name: item.appearance?.label || item.character.trans_name || item.character.name,
      names: [item.character.name, item.character.trans_name ?? ''],
    })),
  )

  const rating = computed(() => gameRating(props.data.rate_stats))
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
      liked: item.my_value === 1,
      date: item.created_at.slice(0, 10),
    })),
  )

  const recommendShown = ref(false)
  const shownWorks = computed(() => [
    ...props.data.relations.map(item => item.target_galgame.id),
    ...(props.data.brand_works
      ? nearbyBrandWorks(props.data.brand_works, props.galgameId).map(work => work.id)
      : []),
  ])
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
      { id: 'recommend', label: '推荐', shown: recommendShown.value },
    ].filter(section => section.shown),
  )
  const { active, go } = useActiveSection(() => sections.value.map(section => section.id))

  const stage = useTemplateRef<HTMLElement>('stage')
  const { bottom } = useElementBounding(stage)
  const pinned = computed(() => !props.embedded && bottom.value < 64 && bottom.value !== 0)

  const rateCtl = useGalgameRate(props.galgameId, props.data.my_rate)
  const rateOpen = ref(false)

  const gallery = reactive(
    useGallery(() => ({ images: images.value, cover: cover.value, title: title.value })),
  )
</script>

<template>
  <Stack
    gap="none"
    class="relative isolate min-h-screen bg-canvas transition-colors duration-700"
    :data-page-tone="scope ? 'stage' : undefined"
    :style="scope"
  >
    <Stack
      gap="none"
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 hidden h-(--ambient-height) mask-(--ambient-fade) opacity-(--tone-glow) transition-opacity duration-700 dark:flex"
    >
      <Transition
        enter-active-class="transition-opacity duration-700"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-700"
        leave-to-class="opacity-0"
      >
        <Stack
          :key="glow"
          gap="none"
          class="absolute inset-0 bg-cover bg-center"
          :style="{ backgroundImage: glow ? `url(${glow})` : undefined }"
        />
      </Transition>
    </Stack>
    <Stack
      gap="none"
      class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-(--ambient-height) bg-(--tone-soft) mask-(--ambient-fade) dark:hidden"
    />
    <Stack ref="stage" gap="none">
      <GalgameStage
        v-model:index="index"
        :data="data"
        :title="title"
        :website="website"
        :languages="languages"
        :zoomable="gallery.viewable(cover)"
        :viewable="gallery.items.length"
        @gallery="gallery.show"
        @cover="gallery.show(images.length)"
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

    <Stack gap="none">
      <Stack
        gap="xl"
        class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:grid lg:grid-cols-[var(--rail-left)_minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6 lg:py-10"
      >
        <Stack as="aside" gap="xl" class="order-last lg:order-first">
          <GalgameFacts :data="data" :website="website" :languages="languages" />
          <EntryTags
            resource="galgames"
            :work-id="galgameId"
            :tags="data.tags"
            :tag-route="tagRoute"
            :cast="cast"
            cast-section="cast"
          />
          <GalgameBrandWorks
            v-if="data.brand_works"
            :works="data.brand_works"
            :current="galgameId"
          />
          <EntryMeta
            :contributors="data.contributors"
            resource-type="galgame"
            :resource-id="galgameId"
            :external="external"
            :views="data.galgame.views"
          />
        </Stack>
        <Stack gap="none" class="min-w-0 gap-12">
          <Stack gap="md"
            ><GalgameIntro :galgame="data.galgame" :intros="data.display.intros"
          /></Stack>
          <Stack gap="md" class="lg:hidden"><EntryRatingCard :rating="rating" plain /></Stack>
          <Stack v-if="data.characters.length" gap="md">
            <GalgameCast :characters="data.characters" />
          </Stack>
          <Stack gap="md">
            <EntryReviews
              :reviews="reviews"
              :count="data.rate_stats.content_count"
              :to="`/galgames/${galgameId}/rates`"
              like-kind="galgame_rate"
              :work-id="galgameId"
              @write="rateOpen = true"
            />
          </Stack>
          <WorkLongReviews :articles="data.articles" />
          <Stack gap="md">
            <GalgameProducts :products="data.products" />
            <GalgameSteam
              v-if="data.galgame.steam_apps.length"
              :galgame-id="galgameId"
              :app-ids="data.galgame.steam_apps.map(app => app.app_id)"
            />
          </Stack>
          <Stack gap="md"><GalgameCrew :credits="data.credits" /></Stack>
          <Stack gap="md"><GalgameRelations :relations="data.relations" /></Stack>
        </Stack>
        <Stack gap="lg" class="hidden lg:sticky lg:top-(--sticky-top) lg:flex">
          <EntryRatingCard :rating="rating" plain />
          <GalgameResources :galgame-id="galgameId" :count="data.galgame.download_resource_count" />
        </Stack>
      </Stack>
    </Stack>

    <GalgameRecommend
      v-if="!embedded"
      v-model:shown="recommendShown"
      :work-id="galgameId"
      :exclude="shownWorks"
    />

    <GalgameRateDialog
      v-model:visible="rateOpen"
      :galgame-id="galgameId"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
    <Lightbox
      v-if="gallery.loaded"
      v-model:open="gallery.open"
      v-model:index="gallery.at"
      :items="gallery.items"
    />
  </Stack>
</template>
