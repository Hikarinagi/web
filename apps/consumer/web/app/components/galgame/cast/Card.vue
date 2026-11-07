<script setup lang="ts">
  import { Card, Inline, Link, Ripple, Spoiler, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameCastCard' })
  const props = defineProps<{ item: GalgamePageData['characters'][number] }>()

  const concealed = ref(Boolean(props.item.appearance?.hidden))
  const name = computed(
    () =>
      props.item.appearance?.label || props.item.character.trans_name || props.item.character.name,
  )
  const image = computed(() => props.item.appearance?.image ?? props.item.character.image)
  const voices = computed(() =>
    props.item.appearance?.voices.length
      ? props.item.appearance.voices.map(voice => ({
          name: voice.text,
          personId: voice.person_id,
          version: [...new Set(voice.versions.flatMap(item => item.platforms))]
            .map(platformLabel)
            .join('、'),
        }))
      : props.item.actors.map(actor => ({
          name: actor.trans_name || actor.name,
          personId: actor.id,
          version: '',
        })),
  )
</script>

<template>
  <Card
    :padded="false"
    :class="concealed ? undefined : 'hn-state-layer hn-interactive hn-press-lg'"
  >
    <Ripple v-if="!concealed" />
    <Inline gap="md" align="center" :wrap="false" class="p-2">
      <HikariImage
        v-if="!concealed"
        :src="image"
        :alt="name"
        :ratio="1"
        class="w-14 shrink-0 rounded-md bg-white"
        image-class="object-cover object-top"
        preset="thumbnail"
        :fallback-src="ENTITY_FALLBACK_IMAGE"
      />
      <Avatar v-else class="size-14! shrink-0" />
      <Stack gap="none" class="min-w-0">
        <Tag v-if="item.appearance?.hidden" tone="warning" class="self-start">含剧透</Tag>
        <Spoiler v-if="concealed" v-model:hidden="concealed" class="text-sm font-medium">
          {{ name }}
        </Spoiler>
        <Link
          v-else
          :as="NuxtLink"
          :to="`/characters/${item.character.id}`"
          tone="neutral"
          :underline="false"
          class="truncate font-medium after:absolute after:inset-0"
          lang="ja"
        >
          {{ name }}
        </Link>
        <Text
          v-if="voices.length && !concealed"
          size="sm"
          tone="muted"
          truncate
          class="relative z-10"
        >
          CV
          <template v-for="(voice, index) in voices" :key="index">
            <Link
              v-if="voice.personId"
              :as="NuxtLink"
              :to="`/people/${voice.personId}`"
              tone="neutral"
              :underline="false"
              class="text-muted hover:text-fg"
              lang="ja"
            >
              {{ voice.name }}
            </Link>
            <template v-else>{{ voice.name }}</template>
            <Text v-if="voice.version" as="span" size="xs" tone="faint" class="ms-1">
              {{ voice.version }}
            </Text>
          </template>
        </Text>
        <Text v-else-if="!concealed" size="sm" tone="faint">声优未登记</Text>
      </Stack>
    </Inline>
  </Card>
</template>
