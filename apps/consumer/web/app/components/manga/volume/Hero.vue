<script setup lang="ts">
  import { Heading, IconButton, Inline, Link, Section, Stack, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { dayText } from '~/features/entry/date'
  import { mangaStaffRoleLabel } from '~/features/manga/labels'
  import type { HikariImageSource } from '~/utils/media/image'
  import { getMangaVolumeTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeHero' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    volumes: MangaVolumePageData['volumes']
    chapters: MangaVolumePageData['chapters']
    people: MangaVolumePageData['people']
    producers: MangaVolumePageData['producers']
    progress: MangaVolumePageData['progress']
    cover: HikariImageSource
    index: number
    previous?: MangaVolumePageData['volumes'][number]
    next?: MangaVolumePageData['volumes'][number]
  }>()

  const title = computed(() => getMangaVolumeTitle(props.volume))
  const seriesTitle = computed(() => props.volume.manga.name_cn || props.volume.manga.name)
  const original = computed(() =>
    props.volume.name_cn && props.volume.name && props.volume.name_cn !== props.volume.name
      ? props.volume.name
      : '',
  )
  const credits = computed(() => [
    ...props.people.map(item => ({
      key: `${item.role}-${item.person.id}`,
      to: `/people/${item.person.id}`,
      name: item.person.name,
      label: item.note || mangaStaffRoleLabel(item.role),
    })),
    ...props.producers
      .filter(item => item.role === 'MAGAZINE')
      .map(item => ({
        key: `magazine-${item.producer.id}`,
        to: `/producers/${item.producer.id}`,
        name: item.producer.name,
        label: '连载',
      })),
  ])
</script>

<template>
  <Section class="bg-(--tone-soft) transition-colors duration-500 dark:bg-(--tone-deep-2)">
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-[calc(var(--app-header-height)+1.5rem)] pb-10 lg:flex-row lg:items-center lg:gap-14 lg:px-6 lg:pt-[calc(var(--app-header-height)+3rem)] lg:pb-14"
    >
      <Stack gap="md" align="center" class="lg:items-start">
        <Transition
          appear
          enter-active-class="transition-opacity duration-(--hn-duration-base) ease-(--hn-ease-enter)"
          enter-from-class="opacity-0"
        >
          <EntryBookCover
            :media="cover"
            :alt="`${title} 封面`"
            preload
            preview
            :width="480"
            class="w-(--volume-cover-sm) shrink-0 shadow-2xl lg:w-(--volume-cover)"
          >
            <NsfwControl
              :images="[cover]"
              :nsfw="volume.manga.nsfw"
              class="absolute bottom-2 left-3"
            />
          </EntryBookCover>
        </Transition>
        <Inline gap="xs" align="center" justify="center" :wrap="false" class="w-full">
          <IconButton
            :as="previous ? NuxtLink : undefined"
            :to="previous ? `/manga-volumes/${previous.id}` : undefined"
            label="上一卷"
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="!previous"
          >
            <ChevronLeft />
          </IconButton>
          <Text size="sm" tone="muted" class="w-20 text-center tabular-nums">
            {{ index + 1 }} / {{ volumes.length }}
          </Text>
          <IconButton
            :as="next ? NuxtLink : undefined"
            :to="next ? `/manga-volumes/${next.id}` : undefined"
            label="下一卷"
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="!next"
          >
            <ChevronRight />
          </IconButton>
        </Inline>
      </Stack>

      <Stack gap="lg" class="min-w-0 flex-1 lg:max-w-2xl">
        <Stack gap="sm">
          <Link
            :as="NuxtLink"
            :to="`/mangas/${volume.manga.id}`"
            tone="neutral"
            class="self-start text-sm font-medium text-muted"
          >
            {{ seriesTitle }}
          </Link>
          <Heading
            :level="1"
            lang="ja"
            class="text-2xl leading-snug font-semibold text-balance [word-break:auto-phrase] lg:text-3xl"
          >
            {{ title }}
          </Heading>
          <Text v-if="original" tone="muted" lang="ja">{{ original }}</Text>
        </Stack>

        <Stack gap="xs">
          <Inline gap="none" class="gap-x-4 gap-y-1">
            <Inline
              v-for="credit in credits"
              :key="credit.key"
              gap="xs"
              align="baseline"
              :wrap="false"
            >
              <Link
                :as="NuxtLink"
                :to="credit.to"
                tone="neutral"
                class="text-sm font-medium"
                lang="ja"
              >
                {{ credit.name }}
              </Link>
              <Text as="span" size="sm" tone="muted">{{ credit.label }}</Text>
            </Inline>
          </Inline>
          <Text v-if="volume.publication_date" size="sm" tone="muted" class="tabular-nums">
            {{ dayText(volume.publication_date) }}发售
          </Text>
        </Stack>

        <MangaVolumeHeroCta
          :volume="volume"
          :volumes="volumes"
          :chapters="chapters"
          :progress="progress"
        />
      </Stack>
    </Stack>
  </Section>
</template>
