<script setup lang="ts">
  import { Heading, IconButton, Inline, Link, Section, Stack, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { dayText } from '~/features/entry/date'
  import {
    getLightNovelCover,
    getLightNovelTitle,
    getLightNovelVolumeCover,
    getLightNovelVolumeTitle,
  } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelVolumeHero' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    lightNovel: LightNovelVolumePageData['light_novel']
    people: LightNovelVolumePageData['people']
    progress: LightNovelVolumePageData['progress']
    myRate: LightNovelVolumePageData['my_rate']
    index: number
    total: number
    previous?: LightNovelVolumePageData['volumes'][number]
    next?: LightNovelVolumePageData['volumes'][number]
  }>()
  const emit = defineEmits<{
    progressChange: [NonNullable<LightNovelVolumePageData['progresses']>]
  }>()

  const title = computed(() => getLightNovelVolumeTitle(props.volume))
  const seriesTitle = computed(() => getLightNovelTitle(props.lightNovel))
  const cover = computed(
    () => getLightNovelVolumeCover(props.volume) ?? getLightNovelCover(props.lightNovel),
  )
  const groups = computed(() =>
    ['author', 'illustrator'].flatMap(relation => {
      const people = props.people.filter(item => item.relation === relation)
      return people.length
        ? [
            {
              label: getLightNovelPersonRelationLabel(relation),
              people: people.map(item => item.person),
            },
          ]
        : []
    }),
  )
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
            :width="480"
            class="w-(--volume-cover-sm) shrink-0 shadow-2xl lg:w-(--volume-cover)"
          />
        </Transition>
        <Inline gap="xs" align="center" justify="center" :wrap="false" class="w-full">
          <IconButton
            :as="previous ? NuxtLink : undefined"
            :to="previous ? `/light-novel-volumes/${previous.id}` : undefined"
            label="上一卷"
            size="sm"
            variant="ghost"
            tone="neutral"
            :disabled="!previous"
          >
            <ChevronLeft />
          </IconButton>
          <Text size="sm" tone="muted" class="w-20 text-center tabular-nums">
            {{ index + 1 }} / {{ total }}
          </Text>
          <IconButton
            :as="next ? NuxtLink : undefined"
            :to="next ? `/light-novel-volumes/${next.id}` : undefined"
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
            :to="`/light-novels/${lightNovel.id}`"
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
        </Stack>

        <Stack gap="xs">
          <Inline gap="none" class="gap-x-4 gap-y-1">
            <Inline
              v-for="group in groups"
              :key="group.label"
              gap="xs"
              align="baseline"
              :wrap="false"
            >
              <Inline gap="none" align="baseline" :wrap="false">
                <template v-for="(person, i) in group.people" :key="person.id">
                  <Text v-if="i" as="span" size="sm" tone="muted">、</Text>
                  <Link
                    :as="NuxtLink"
                    :to="`/people/${person.id}`"
                    tone="neutral"
                    class="text-sm font-medium"
                    lang="ja"
                  >
                    {{ person.name }}
                  </Link>
                </template>
              </Inline>
              <Text as="span" size="sm" tone="muted">{{ group.label }}</Text>
            </Inline>
          </Inline>
          <Text v-if="volume.publication_date" size="sm" tone="muted" class="tabular-nums">
            {{ dayText(volume.publication_date) }}发售
          </Text>
        </Stack>

        <LightNovelVolumeHeroProgress
          :volume-id="volume.id"
          :progress="progress"
          :preceding-count="index + 1"
          @change="emit('progressChange', $event)"
        />
        <LightNovelVolumeHeroCta :volume="volume" :progress="progress" :my-rate="myRate" />
        <LightNovelVolumeHeroClaim :volume-id="volume.id" :provider="volume.epub_provider" />
      </Stack>
    </Stack>
  </Section>
</template>
