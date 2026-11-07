<script setup lang="ts">
  import { Heading, Inline, LineClamp, Link, Section, Select, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
  import {
    voiceSummary,
    yearOf,
    type Appearance,
    type CastMember,
    type viewOf,
  } from '~/features/character/appearances'

  defineOptions({ name: 'CharacterStage' })
  const props = defineProps<{
    character: CharacterPageData['character']
    contributors: CharacterPageData['contributors']
    appearances: Appearance[]
    work: Appearance | null
    view: ReturnType<typeof viewOf>
    cast: CastMember[]
    external: { label: string; href: string }[]
  }>()
  const selected = defineModel<string>({ required: true })

  const voices = computed(() => voiceSummary(props.appearances))
  const single = computed(() => props.appearances.length === 1)
  const options = computed(() =>
    [...props.appearances]
      .reverse()
      .map(item => ({ value: item.key, label: `${item.title}（${yearOf(item.date)}）` })),
  )
</script>

<template>
  <Section>
    <Stack
      gap="lg"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-[calc(var(--app-header-height)+1.5rem)] lg:px-6 lg:pt-[calc(var(--app-header-height)+2rem)]"
    >
      <Stack gap="lg" class="lg:flex-row lg:items-end lg:gap-10">
        <CharacterPortrait
          v-if="view.image"
          :image="view.image"
          :nsfw="view.nsfw"
          :alt="character.name"
          class="mx-auto w-60 shrink-0 lg:mx-0 lg:w-(--char-image)"
        />
        <Stack gap="md" class="min-w-0 flex-1 self-start">
          <Inline v-if="work" gap="sm" align="center" :wrap="false" class="min-w-0">
            <NuxtLink
              :to="work.path"
              class="block w-8 shrink-0 hn-interactive rounded-sm"
              :aria-label="work.title"
            >
              <HikariImage
                :src="work.cover"
                :alt="work.title"
                :nsfw="work.nsfw"
                :ratio="7 / 10"
                preset="thumbnail"
                image-class="object-cover"
                class="w-full overflow-hidden rounded-sm bg-subtle ring-1 ring-black/5"
              />
            </NuxtLink>
            <Select
              v-if="!single"
              v-model="selected"
              :options="options"
              size="sm"
              aria-label="显示哪一作"
              class="max-w-80 min-w-0"
            />
            <Inline v-else gap="sm" align="baseline" :wrap="false" class="min-w-0">
              <Link
                :as="NuxtLink"
                :to="work.path"
                tone="neutral"
                class="truncate text-sm"
                lang="ja"
              >
                {{ work.title }}
              </Link>
              <Text as="span" size="sm" tone="muted" class="shrink-0 tabular-nums">
                {{ yearOf(work.date) }}
              </Text>
            </Inline>
          </Inline>

          <Stack gap="xs">
            <Text v-if="character.reading" size="sm" tone="muted" lang="ja" class="tracking-wider">
              {{ character.reading }}
            </Text>
            <Heading :level="1" lang="ja" class="text-4xl leading-tight font-semibold lg:text-5xl">
              {{ character.name }}
            </Heading>
            <Text v-if="character.aliases.length" size="sm" tone="muted" lang="ja">
              {{ character.aliases.join('、') }}
            </Text>
          </Stack>

          <Inline v-if="voices.length" gap="none" class="gap-x-4 gap-y-1" align="baseline">
            <Text as="span" size="sm" tone="muted">CV</Text>
            <Inline
              v-for="voice in voices"
              :key="voice.text"
              gap="xs"
              align="baseline"
              :wrap="false"
            >
              <Link
                v-if="voice.person"
                :as="NuxtLink"
                :to="`/people/${voice.person}`"
                tone="neutral"
                class="font-medium"
                lang="ja"
              >
                {{ voice.text }}
              </Link>
              <Text v-else as="span" weight="medium" lang="ja">{{ voice.text }}</Text>
              <Text v-if="!single" as="span" size="xs" tone="muted" class="tabular-nums">
                {{ voice.count }} 部
              </Text>
            </Inline>
          </Inline>

          <CharacterProfile :profile="view.profile" :character-id="character.id" />

          <Stack v-if="view.intro" gap="xs">
            <Text v-if="view.introFrom" size="xs" tone="muted">
              出自《{{ view.introFrom.title }}》
            </Text>
            <LineClamp :key="view.intro" :lines="6" expand-label="展开" collapse-label="收起">
              <Text
                class="leading-relaxed whitespace-pre-line"
                :lang="view.original ? 'ja' : undefined"
              >
                {{ view.intro }}
              </Text>
            </LineClamp>
          </Stack>
        </Stack>
        <Stack
          justify="between"
          gap="lg"
          class="hidden w-(--rail-right) shrink-0 self-stretch lg:flex"
        >
          <Inline justify="end">
            <ShareButton :to="`/characters/${character.id}`" tooltip="分享" size="sm" />
          </Inline>
          <EntryMeta
            plain
            :contributors="contributors"
            resource-type="character"
            :resource-id="character.id"
            :external="external"
          />
        </Stack>
      </Stack>
      <CharacterCast :cast="cast" :character-id="character.id" />
    </Stack>
  </Section>
</template>
