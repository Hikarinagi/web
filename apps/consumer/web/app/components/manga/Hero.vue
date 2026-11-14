<script setup lang="ts">
  import { Heading, Inline, Link, Section, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { EntryRating } from '~/components/entry/RatingCard.vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { dayText } from '~/features/entry/date'
  import { contentsStatus, contentsUnits } from '~/features/manga/contents'
  import { mangaSerialStatusLabel, mangaStaffRoleLabel } from '~/features/manga/labels'
  import { getMangaCover, getMangaTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaHero' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    chapters: MangaPageData['chapters']
    volumes: MangaPageData['volumes']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    myRate: MangaPageData['my_rate']
    progress: MangaPageData['progress']
    favorited?: boolean
    rating?: EntryRating
  }>()

  const STRIP = 12
  const title = computed(() => getMangaTitle(props.manga))
  const original = computed(() =>
    props.manga.name_cn && props.manga.name_cn !== props.manga.name ? props.manga.name : '',
  )
  const cover = computed(() => getMangaCover(props.manga))
  const strip = computed(() => props.volumes.filter(volume => volume.cover).slice(-STRIP))
  const front = computed(() => strip.value.at(-1)?.cover ?? cover.value)
  const finished = computed(() => props.manga.serial_status === 'FINISHED')
  const statusLabel = computed(() => mangaSerialStatusLabel(props.manga.serial_status))
  const update = computed(() => {
    const text = contentsStatus(contentsUnits(props.chapters), finished.value)
    return text?.replace('更新至 ', '更新至')
  })
  const credits = computed(() =>
    props.people.map(item => ({
      key: `${item.role}-${item.person.id}`,
      to: `/people/${item.person.id}`,
      name: item.person.name,
      label: item.note || mangaStaffRoleLabel(item.role),
    })),
  )
  const magazine = computed(
    () => props.producers.find(item => item.role === 'MAGAZINE')?.producer ?? null,
  )
  const publisher = computed(
    () => props.producers.find(item => item.role === 'PUBLISHER')?.producer ?? null,
  )
</script>

<template>
  <Section class="relative isolate">
    <Stack gap="none" class="relative h-(--manga-banner-sm) overflow-hidden lg:h-(--manga-banner)">
      <Inline gap="none" :wrap="false" class="absolute inset-y-0 right-0 h-full">
        <HikariImage
          v-for="volume in strip"
          :key="volume.id"
          :src="volume.cover"
          alt=""
          :ratio="7 / 11"
          :processing="{ width: 320, quality: 72, fit: 'cover', format: 'auto' }"
          class="w-(--manga-strip-cover) shrink-0 lg:w-(--manga-strip-cover-lg)"
          image-class="object-cover"
        />
      </Inline>
      <Stack gap="none" class="absolute inset-0 bg-(--hn-bg-canvas)/35" />
      <Stack
        gap="none"
        class="absolute inset-x-0 top-0 h-24 bg-linear-to-b from-(--hn-bg-canvas)/85 to-transparent"
      />
      <Stack
        gap="none"
        class="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-b from-transparent to-(--hn-bg-canvas)"
      />
    </Stack>

    <Stack
      gap="none"
      class="mx-auto grid w-full max-w-(--entry-container) grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-6 px-4 pb-10 [grid-template-areas:'cover_title'_'body_body'_'rating_rating'] lg:grid-cols-[auto_minmax(0,1fr)_var(--rail-right)] lg:gap-x-10 lg:gap-y-5 lg:px-6 lg:pb-12 lg:[grid-template-areas:'cover_title_rating'_'cover_body_rating']"
    >
      <Stack
        gap="none"
        class="relative w-(--manga-cover-sm) [grid-area:cover] lg:w-(--manga-cover)"
      >
        <EntryBookCover
          :media="front"
          :alt="`${title} 封面`"
          preload
          :width="480"
          class="absolute! inset-x-0 bottom-0 shadow-2xl"
        >
          <NsfwControl
            :images="[cover, ...volumes.map(volume => volume.cover)]"
            :nsfw="manga.nsfw"
            class="absolute bottom-2 left-3"
          />
        </EntryBookCover>
      </Stack>

      <Stack gap="sm" class="min-w-0 self-end [grid-area:title] lg:self-start lg:pt-2">
        <Inline gap="sm" align="center">
          <Tag v-if="statusLabel" :tone="finished ? 'success' : 'info'">{{ statusLabel }}</Tag>
          <Text v-if="update" size="sm" tone="muted" class="tabular-nums">{{ update }}</Text>
          <Text
            v-if="manga.latest_chapter_at && !finished"
            size="sm"
            tone="muted"
            class="hidden tabular-nums sm:inline"
          >
            {{ dayText(manga.latest_chapter_at) }}
          </Text>
        </Inline>
        <Heading :level="1" class="text-3xl leading-tight font-bold tracking-tight lg:text-5xl">
          {{ title }}
        </Heading>
        <Text v-if="original" size="sm" tone="muted" lang="ja" class="lg:text-base">
          {{ original }}
        </Text>
      </Stack>

      <Stack gap="md" class="min-w-0 [grid-area:body] lg:self-end">
        <Inline gap="none" class="gap-x-5 gap-y-1 text-sm">
          <Inline
            v-for="credit in credits"
            :key="credit.key"
            gap="xs"
            align="baseline"
            :wrap="false"
          >
            <Link :as="NuxtLink" :to="credit.to" tone="neutral" class="font-medium" lang="ja">
              {{ credit.name }}
            </Link>
            <Text as="span" size="sm" tone="muted">{{ credit.label }}</Text>
          </Inline>
          <Inline v-if="magazine" gap="xs" align="baseline" :wrap="false">
            <Link
              :as="NuxtLink"
              :to="`/mangas/magazine/${magazine.id}`"
              tone="neutral"
              class="font-medium"
              lang="ja"
            >
              {{ magazine.name }}
            </Link>
            <Text as="span" size="sm" tone="muted">连载</Text>
          </Inline>
          <Text v-if="publisher" as="span" size="sm" tone="muted" lang="ja">
            {{ publisher.name }}
          </Text>
        </Inline>
        <MangaHeroCta
          :manga-id="manga.id"
          :title="title"
          :chapters="chapters"
          :my-rate="myRate"
          :progress="progress"
          :favorited="favorited ?? false"
        />
        <MangaHeroContribute
          v-if="!finished"
          :manga-id="manga.id"
          :title="title"
          :chapters="chapters"
        />
      </Stack>

      <Stack
        v-if="rating"
        gap="none"
        class="border-t border-line pt-6 [grid-area:rating] lg:self-start lg:border-t-0 lg:border-l lg:py-2 lg:pl-10"
      >
        <EntryRatingCard :rating="rating" plain />
      </Stack>
    </Stack>
  </Section>
</template>
