<script setup lang="ts">
  import {
    IconButton,
    Inline,
    Link,
    SimpleGrid,
    Stack,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { ArrowUpToLine } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
  import { KIND_LABELS, yearOf, type Appearance } from '~/features/character/appearances'

  defineOptions({ name: 'CharacterAppearances' })
  const props = defineProps<{
    character: CharacterPageData['character']
    appearances: Appearance[]
    selected: string
  }>()
  defineEmits<{ show: [key: string] }>()

  const kinds = computed(() => {
    const counts = new Map<Appearance['kind'], number>()
    for (const item of props.appearances) counts.set(item.kind, (counts.get(item.kind) ?? 0) + 1)
    return [...counts].map(([kind, count]) => ({ kind, count, label: KIND_LABELS[kind] }))
  })
  const tab = ref('ALL')
  const listed = computed(() =>
    props.appearances.filter(item => tab.value === 'ALL' || item.kind === tab.value),
  )
  const plainName = (text: string) => text.replace(/\s/g, '')
  const named = (label: string | null) =>
    label && plainName(label) !== plainName(props.character.name) ? `本作中为 ${label}` : null
</script>

<template>
  <Stack gap="md">
    <EntrySectionHead id="appearances" title="出场作品" :count="appearances.length" />
    <Tabs v-if="kinds.length > 1" v-model="tab">
      <TabsList label="按媒介">
        <TabsTrigger value="ALL">全部 {{ appearances.length }}</TabsTrigger>
        <TabsTrigger v-for="item in kinds" :key="item.kind" :value="item.kind">
          {{ item.label }} {{ item.count }}
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <SimpleGrid min="min(30rem, 100%)" gap="none" class="-mx-3 gap-x-4">
      <Inline
        v-for="item in listed"
        :key="item.key"
        gap="sm"
        align="center"
        :wrap="false"
        class="min-w-0 rounded-lg p-2 pl-3 transition-colors duration-(--hn-duration-fast)"
        :class="item.key === selected ? 'bg-accent-soft/40' : 'hover:bg-subtle'"
      >
        <Text size="sm" tone="muted" class="w-10 shrink-0 tabular-nums">
          {{ yearOf(item.date) }}
        </Text>
        <NuxtLink
          :to="item.path"
          class="block w-10 shrink-0 hn-interactive rounded-sm"
          :aria-label="item.title"
        >
          <HikariImage
            :src="item.cover"
            :alt="item.title"
            :nsfw="item.nsfw"
            :ratio="7 / 10"
            preset="thumbnail"
            image-class="object-cover"
            class="w-full overflow-hidden rounded-sm bg-subtle ring-1 ring-black/5"
          />
        </NuxtLink>
        <HikariImage
          v-if="item.image"
          :src="item.image"
          :alt="`${item.title} 中的${character.name}`"
          :nsfw="item.nsfw"
          :ratio="1"
          :processing="{ gravity: 'face' }"
          preset="thumbnail"
          image-class="object-cover object-top"
          class="w-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-black/5"
        />
        <Stack gap="none" class="ml-1 min-w-0 flex-1">
          <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
            <Link
              :as="NuxtLink"
              :to="item.path"
              tone="neutral"
              class="truncate font-medium"
              lang="ja"
            >
              {{ item.title }}
            </Link>
            <Text v-if="item.kind !== 'galgame'" as="span" size="xs" tone="muted" class="shrink-0">
              {{ KIND_LABELS[item.kind] }}
            </Text>
          </Inline>
          <Text
            v-if="named(item.label) || item.group"
            size="xs"
            tone="muted"
            class="truncate"
            lang="ja"
          >
            {{ [named(item.label), item.group].filter(Boolean).join(' ') }}
          </Text>
          <Inline
            v-if="item.voices.length"
            gap="none"
            align="baseline"
            :wrap="false"
            class="min-w-0 gap-x-2 overflow-hidden"
          >
            <Text as="span" size="xs" tone="muted">CV</Text>
            <template v-for="voice in item.voices" :key="voice.text">
              <Link
                v-if="voice.person_id"
                :as="NuxtLink"
                :to="`/people/${voice.person_id}`"
                tone="neutral"
                class="shrink-0 text-xs text-muted"
                lang="ja"
              >
                {{ voice.text }}
              </Link>
              <Text v-else as="span" size="xs" tone="muted" class="shrink-0" lang="ja">
                {{ voice.text }}
              </Text>
            </template>
          </Inline>
        </Stack>
        <IconButton
          v-if="item.key !== selected"
          label="切换至此作品"
          variant="ghost"
          tone="neutral"
          size="sm"
          class="shrink-0"
          @click="$emit('show', item.key)"
        >
          <ArrowUpToLine />
        </IconButton>
      </Inline>
    </SimpleGrid>
  </Stack>
</template>
