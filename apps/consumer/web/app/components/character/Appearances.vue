<script setup lang="ts">
  import {
    Center,
    IconButton,
    Inline,
    Ripple,
    SimpleGrid,
    Stack,
    Tabs,
    TabsList,
    TabsTrigger,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ArrowUpToLine } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { CharacterPageData } from '~~/server/api/pages/characters/[id].get'
  import { KIND_LABELS, yearOf, type Appearance } from '~/features/character/appearances'
  import { CODE_LABELS } from '~/features/wiki/codes'

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
  const notes = (item: Appearance) =>
    [
      named(item.label),
      item.group,
      item.cast_role && !item.protagonist ? CODE_LABELS.CAST_ROLE?.[item.cast_role] : null,
    ]
      .filter(Boolean)
      .join(' ')
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
    <SimpleGrid min="min(30rem, 100%)" gap="none" class="-mx-3 gap-x-4 gap-y-1">
      <Inline
        v-for="item in listed"
        :key="item.key"
        gap="xs"
        align="center"
        :wrap="false"
        class="min-w-0"
      >
        <Inline
          :as="NuxtLink"
          :to="item.path"
          gap="sm"
          align="center"
          :wrap="false"
          :aria-current="item.key === selected || undefined"
          class="hn-state-layer min-w-0 flex-1 hn-interactive overflow-hidden rounded-lg p-2 pl-3 outline-(length:--hn-focus-ring-width) outline-offset-(--hn-focus-ring-offset) outline-solid hn-press-lg"
          :class="item.key === selected ? 'outline-(--hn-focus-ring)' : 'outline-transparent'"
        >
          <Ripple />
          <Text size="sm" tone="muted" class="w-10 shrink-0 tabular-nums">
            {{ yearOf(item.date) }}
          </Text>
          <HikariImage
            :src="item.cover"
            :alt="item.title"
            :ratio="7 / 10"
            preset="thumbnail"
            image-class="object-cover"
            class="w-10 shrink-0 overflow-hidden rounded-sm bg-subtle ring-1 ring-black/5"
          />
          <HikariImage
            v-if="item.image"
            :src="item.image"
            :alt="`${item.title} 中的${character.name}`"
            :ratio="1"
            :processing="{ gravity: 'face' }"
            preset="thumbnail"
            image-class="object-cover object-top"
            class="w-12 shrink-0 overflow-hidden rounded-md bg-white ring-1 ring-black/5"
          />
          <Stack gap="none" class="ml-1 min-w-0 flex-1">
            <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
              <Text as="span" weight="medium" truncate lang="ja">{{ item.title }}</Text>
              <Text
                v-if="item.kind !== 'galgame'"
                as="span"
                size="xs"
                tone="muted"
                class="shrink-0"
              >
                {{ KIND_LABELS[item.kind] }}
              </Text>
              <Tag v-if="item.capturable" tone="accent" size="sm" class="shrink-0">可攻略</Tag>
              <Tag v-if="item.protagonist" tone="neutral" size="sm" class="shrink-0">主人公</Tag>
            </Inline>
            <Text v-if="notes(item)" size="xs" tone="muted" class="truncate" lang="ja">
              {{ notes(item) }}
            </Text>
            <Inline
              v-if="item.voices.length"
              gap="none"
              align="baseline"
              :wrap="false"
              class="min-w-0 gap-x-2 overflow-hidden"
            >
              <Text as="span" size="xs" tone="muted">CV</Text>
              <Text
                v-for="voice in item.voices"
                :key="voice.text"
                as="span"
                size="xs"
                tone="muted"
                class="shrink-0"
                lang="ja"
              >
                {{ voice.text }}
              </Text>
            </Inline>
          </Stack>
        </Inline>
        <Center class="size-(--hn-control-h-sm) shrink-0">
          <Transition
            enter-active-class="transition-opacity duration-(--hn-duration-fast) ease-(--hn-ease-enter)"
            enter-from-class="opacity-0"
            leave-active-class="transition-opacity duration-(--hn-duration-exit) ease-(--hn-ease-exit)"
            leave-to-class="opacity-0"
          >
            <Center v-if="item.key !== selected">
              <IconButton
                label="切换至此作品"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="$emit('show', item.key)"
              >
                <ArrowUpToLine />
              </IconButton>
            </Center>
          </Transition>
        </Center>
      </Inline>
    </SimpleGrid>
  </Stack>
</template>
