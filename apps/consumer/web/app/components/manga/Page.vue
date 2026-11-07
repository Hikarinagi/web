<script setup lang="ts">
  import { LineClamp, Stack, Text } from '@hina-ui/vue'
  import type { EntryRating } from '~/components/entry/RatingCard.vue'
  import type { EntryReview } from '~/components/entry/Reviews.vue'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { tagRoute } from '~/features/manga/explore'
  import { MANGA_STATUS_LABEL, type MangaRateStatus } from '~/features/manga/rate'
  import { useMangaRate } from '~/features/manga/useMangaRate'
  import { getMangaCover, getMangaTitle } from '~/utils/media/manga'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaPage' })
  const props = defineProps<{ data: MangaPageData; mangaId: number }>()
  defineEmits<{ refresh: [] }>()

  const title = computed(() => getMangaTitle(props.data.manga))
  const hash = computed(() => {
    const cover =
      props.data.volumes.findLast(volume => volume.cover)?.cover ?? getMangaCover(props.data.manga)
    return cover?.thumb_hash ?? null
  })
  usePageTone(hash, { paper: true })

  const summary = computed(() => props.data.manga.summary_cn || props.data.manga.summary || '')
  const rating = computed<EntryRating>(() => {
    const stats = props.data.rate_stats
    return {
      average: stats.average,
      rated: stats.rated_count,
      distribution: stats.distribution,
      dimensions: [],
      statuses: [
        { label: '想看', count: stats.status_counts.plan },
        { label: '在看', count: stats.status_counts.going },
        { label: '看过', count: stats.status_counts.completed },
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
      status: item.status ? MANGA_STATUS_LABEL[item.status as MangaRateStatus] : undefined,
      likes: item.like_count,
      date: item.created_at.slice(0, 10),
    })),
  )
  const characters = computed(() =>
    props.data.characters.map(item => ({
      id: item.character.id,
      name: item.character.trans_name || item.character.name,
      image: item.character.image,
    })),
  )
  const tags = computed(() =>
    props.data.tags.map(item => ({
      id: item.tag.id,
      name: item.tag.name,
      to: tagRoute(item.tag.id),
    })),
  )
  const external = computed(() =>
    props.data.manga.bangumi_subject_id
      ? [
          {
            label: 'Bangumi',
            href: `https://bangumi.tv/subject/${props.data.manga.bangumi_subject_id}`,
          },
        ]
      : [],
  )

  const rateCtl = useMangaRate(props.mangaId, props.data.my_rate)
  const rateOpen = ref(false)
</script>

<template>
  <Stack gap="none" class="relative isolate min-h-screen bg-canvas">
    <MangaHero
      :manga="data.manga"
      :chapters="data.chapters"
      :volumes="data.volumes"
      :people="data.people"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :progress="data.progress"
      :favorited="data.favorite?.favorited ?? false"
      :rating="rating"
    />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6"
    >
      <Stack gap="none" class="min-w-0 gap-12">
        <Stack v-if="summary" gap="md">
          <EntrySectionHead id="intro" title="简介" />
          <LineClamp :lines="3" expand-label="展开" collapse-label="收起">
            <Text class="leading-relaxed wrap-anywhere whitespace-pre-line">{{ summary }}</Text>
          </LineClamp>
        </Stack>
        <MangaContentsPanel
          :manga-id="data.manga.id"
          :chapters="data.chapters"
          :progress="data.progress"
          :finished="data.manga.serial_status === 'FINISHED'"
          :latest-chapter-at="data.manga.latest_chapter_at"
          @refresh="$emit('refresh')"
        />
        <Stack v-if="characters.length" gap="md">
          <EntryCharacters :characters="characters" />
        </Stack>
        <Stack gap="md">
          <EntryReviews
            :reviews="reviews"
            :count="data.rate_stats.content_count"
            :to="`/mangas/${mangaId}/rates`"
            @write="rateOpen = true"
          />
        </Stack>
      </Stack>
      <Stack as="aside" gap="xl" class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
        <MangaFacts
          :manga="data.manga"
          :people="data.people"
          :producers="data.producers"
          :volumes="data.volumes"
        />
        <MangaEditionList v-if="data.manga.editions?.length" :editions="data.manga.editions" />
        <EntryTags :tags="tags" />
        <EntryMeta
          :contributors="data.contributors"
          resource-type="manga"
          :resource-id="mangaId"
          :updated-at="data.manga.revised_at ?? data.manga.created_at"
          :external="external"
          :views="data.manga.views"
        />
      </Stack>
    </Stack>

    <MangaRateDialog
      v-model:visible="rateOpen"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Stack>
</template>
