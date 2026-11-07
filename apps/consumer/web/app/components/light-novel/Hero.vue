<script setup lang="ts">
  import { Heading, Inline, LineClamp, Link, Section, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { EntryRating } from '~/components/entry/RatingCard.vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { monthText } from '~/features/entry/date'
  import {
    getLightNovelCover,
    getLightNovelTitle,
    getLightNovelVolumeCover,
  } from '~/utils/media/light-novel'

  const props = defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    volumes: LightNovelPageData['volumes']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
    myRate: LightNovelPageData['my_rate']
    favorited: boolean
    progress: LightNovelPageData['progress']
    rating?: EntryRating
  }>()

  const title = computed(() => getLightNovelTitle(props.lightNovel))
  const parts = computed(() => {
    const match = /^(.+?)\s*([～~].+[～~])$/.exec(title.value)
    return match ? { main: match[1]!, sub: match[2]! } : { main: title.value, sub: '' }
  })
  const original = computed(() =>
    props.lightNovel.name_cn && props.lightNovel.name_cn !== props.lightNovel.name
      ? props.lightNovel.name
      : '',
  )
  const cover = computed(() => getLightNovelCover(props.lightNovel))
  const latest = computed(() => {
    const volume = props.volumes.at(-1)
    return (volume && getLightNovelVolumeCover(volume)) ?? cover.value
  })
  const first = computed(() => props.volumes.find(volume => volume.publication_date))
  const last = computed(() => props.volumes.findLast(volume => volume.publication_date))
  const finished = computed(() => props.lightNovel.novel_status === 'FINISHED')
  const statusLabel = computed(() =>
    props.lightNovel.novel_status ? getNovelStatusLabel(props.lightNovel.novel_status) : '',
  )
  const credits = computed(() =>
    props.people
      .filter(item => ['author', 'illustrator'].includes(item.relation))
      .map(item => ({
        id: item.person.id,
        name: item.person.name,
        label: getLightNovelPersonRelationLabel(item.relation),
      })),
  )
  const publishers = computed(() =>
    [...new Set(props.producers.map(item => item.producer.name))].join('、'),
  )
  const summary = computed(() =>
    (props.lightNovel.summary_cn || props.lightNovel.summary || '')
      .replace(/[ \t]+\r?\n/g, '\n')
      .replace(/\r/g, '')
      .replace(/\n{2,}/g, '\n'),
  )
</script>

<template>
  <Section class="relative isolate overflow-hidden">
    <HikariImage
      v-if="latest"
      :src="latest"
      alt=""
      :skeleton="false"
      :processing="{ width: 480, quality: 60, fit: 'cover', format: 'auto' }"
      class="absolute! inset-0 -z-20 size-full scale-125 blur-3xl"
      image-class="object-cover"
    />
    <Stack gap="none" class="absolute inset-0 -z-10 bg-(--hn-bg-canvas)/75" />
    <Stack
      gap="none"
      class="absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-b from-transparent to-(--hn-bg-canvas)"
    />

    <Stack
      gap="none"
      class="mx-auto grid w-full max-w-(--entry-container) grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-6 px-4 pt-[calc(var(--app-header-height)+1.5rem)] pb-10 [grid-template-areas:'cover_title'_'body_body'_'rating_rating'] lg:grid-cols-[auto_minmax(0,1fr)_var(--rail-right)] lg:gap-x-10 lg:gap-y-5 lg:px-6 lg:pt-[calc(var(--app-header-height)+3rem)] lg:pb-16 lg:[grid-template-areas:'cover_title_rating'_'cover_body_rating']"
    >
      <LightNovelHeroCoverStack
        :volumes="volumes"
        :fallback="cover"
        :title="title"
        class="self-end [grid-area:cover] lg:self-start"
      />

      <Stack gap="sm" class="min-w-0 self-end [grid-area:title] lg:self-start lg:pt-4">
        <Inline gap="sm" align="center">
          <Tag v-if="statusLabel" :tone="finished ? 'success' : 'info'">{{ statusLabel }}</Tag>
          <Text v-if="volumes.length" size="sm" tone="muted" class="tabular-nums">
            全 {{ volumes.length }} 卷
          </Text>
          <Text v-if="first && last" size="sm" tone="muted" class="hidden tabular-nums sm:inline">
            {{ monthText(first.publication_date) }}至 {{ monthText(last.publication_date) }}
          </Text>
        </Inline>
        <Heading :level="1" class="text-3xl leading-tight font-bold tracking-tight lg:text-5xl">
          {{ parts.main }}
          <Text
            v-if="parts.sub"
            as="span"
            class="mt-1 block text-lg font-semibold text-fg/75 lg:text-2xl"
          >
            {{ parts.sub }}
          </Text>
        </Heading>
        <Text v-if="original" size="sm" tone="muted" lang="ja" class="lg:text-base">
          {{ original }}
        </Text>
      </Stack>

      <Stack gap="md" class="min-w-0 [grid-area:body] lg:self-end">
        <Inline gap="none" class="gap-x-5 gap-y-1 text-sm">
          <Inline
            v-for="credit in credits"
            :key="`${credit.label}-${credit.id}`"
            gap="xs"
            align="baseline"
            :wrap="false"
          >
            <Link
              :as="NuxtLink"
              :to="`/people/${credit.id}`"
              tone="neutral"
              class="font-medium"
              lang="ja"
            >
              {{ credit.name }}
            </Link>
            <Text as="span" size="sm" tone="muted">{{ credit.label }}</Text>
          </Inline>
          <Text v-if="publishers" as="span" size="sm" tone="muted" lang="ja">{{ publishers }}</Text>
        </Inline>
        <LineClamp
          v-if="summary"
          :lines="2"
          expand-label="展开"
          collapse-label="收起"
          class="max-w-3xl"
        >
          <Text size="sm" class="leading-relaxed whitespace-pre-line text-fg/85">{{
            summary
          }}</Text>
        </LineClamp>
        <LightNovelHeroCta
          :light-novel-id="lightNovel.id"
          :title="title"
          :volumes="volumes"
          :my-rate="myRate"
          :favorited="favorited"
          :progress="progress"
        />
      </Stack>

      <Stack
        v-if="rating"
        gap="none"
        class="border-t border-line pt-6 [grid-area:rating] lg:self-start lg:border-t-0 lg:border-l lg:py-4 lg:pl-10"
      >
        <EntryRatingCard :rating="rating" plain />
      </Stack>
    </Stack>
  </Section>
</template>
