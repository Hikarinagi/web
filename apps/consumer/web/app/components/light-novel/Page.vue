<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { EntryReview } from '~/components/entry/Reviews.vue'
  import { entryRating } from '~/features/entry/rating'
  import { usePageTone } from '~/features/entry/usePageTone'
  import { tagRoute } from '~/features/light-novel/explore'
  import { LIGHT_NOVEL_STATUS_LABEL, type LightNovelRateStatus } from '~/features/light-novel/rate'
  import { useLightNovelRate } from '~/features/light-novel/useLightNovelRate'
  import { topVotedMedia } from '~/utils/media/image'
  import {
    getLightNovelCover,
    getLightNovelTitle,
    getLightNovelVolumeCover,
  } from '~/utils/media/light-novel'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelPage' })
  const props = defineProps<{ data: LightNovelPageData; lightNovelId: number }>()

  const title = computed(() => getLightNovelTitle(props.data.light_novel))
  const hash = computed(() => {
    const volume = props.data.volumes.at(-1)
    const cover =
      (volume && getLightNovelVolumeCover(volume)) ?? getLightNovelCover(props.data.light_novel)
    return cover?.thumb_hash ?? null
  })
  usePageTone(hash, { paper: true })

  const rating = computed(() => entryRating(props.data.rate_stats, ['想读', '在读', '读过']))
  const reviews = computed<EntryReview[]>(() =>
    props.data.top_rates.items.map(item => ({
      id: item.id,
      score: item.rate,
      text: item.rate_content,
      spoiler: item.is_spoiler,
      rater: item.rater,
      status: item.status
        ? LIGHT_NOVEL_STATUS_LABEL[item.status as LightNovelRateStatus]
        : undefined,
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
  const works = (list: LightNovelPageData['author_works']) =>
    (list?.items ?? [])
      .filter(item => item.light_novel.id !== props.lightNovelId)
      .slice(0, 5)
      .map(({ light_novel: work }) => ({
        id: work.id,
        title: work.name_cn || work.name,
        to: `/light-novels/${work.id}`,
        cover: topVotedMedia(work.covers),
        year: work.publication_date?.slice(0, 4),
      }))
  const external = computed(() =>
    props.data.light_novel.bangumi_book_id
      ? [
          {
            label: 'Bangumi',
            href: `https://bgm.tv/subject/${props.data.light_novel.bangumi_book_id}`,
          },
        ]
      : [],
  )

  const rateCtl = useLightNovelRate(props.lightNovelId, props.data.my_rate)
  const rateOpen = ref(false)
</script>

<template>
  <Stack gap="none" class="relative isolate min-h-screen bg-canvas">
    <LightNovelHero
      :light-novel="data.light_novel"
      :volumes="data.volumes"
      :people="data.people"
      :producers="data.producers"
      :my-rate="data.my_rate"
      :favorited="data.favorite?.favorited ?? false"
      :progress="data.progress"
      :rating="rating"
    />

    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 pb-16 lg:grid lg:grid-cols-[minmax(0,1fr)_var(--rail-right)] lg:items-start lg:gap-10 lg:px-6"
    >
      <Stack gap="none" class="min-w-0 gap-12">
        <Stack v-if="data.volumes.length" gap="md">
          <LightNovelShelf :volumes="data.volumes" :progress="data.progress" />
        </Stack>
        <Stack v-if="characters.length" gap="md"
          ><EntryCharacters :characters="characters"
        /></Stack>
        <Stack gap="md"><LightNovelRelations :relations="data.relations" /></Stack>
        <Stack gap="md">
          <EntryReviews
            :reviews="reviews"
            :count="data.rate_stats.content_count"
            :to="`/light-novels/${lightNovelId}/rates`"
            @write="rateOpen = true"
          />
        </Stack>
        <WorkLongReviews :articles="data.articles" />
      </Stack>
      <Stack as="aside" gap="xl" class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]">
        <LightNovelFacts
          :light-novel="data.light_novel"
          :volumes="data.volumes"
          :people="data.people"
          :producers="data.producers"
        />
        <EntryTags :tags="tags" />
        <EntryRailWorks title="作者的其他作品" :works="works(data.author_works)" />
        <EntryRailWorks title="插画的其他作品" :works="works(data.illustrator_works)" />
        <EntryMeta
          :contributors="data.contributors"
          resource-type="light-novel"
          :resource-id="lightNovelId"
          :external="external"
          :views="data.light_novel.views"
        />
      </Stack>
    </Stack>

    <LightNovelRateDialog
      v-model:visible="rateOpen"
      :light-novel-id="lightNovelId"
      :rate="rateCtl.rate.value"
      :work-title="title"
      :upsert="rateCtl.upsert"
      :remove="rateCtl.remove"
    />
  </Stack>
</template>
