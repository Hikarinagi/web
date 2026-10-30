<script setup lang="ts">
  import {
    Card,
    Inline,
    Link,
    Ripple,
    Spoiler,
    Stack,
    Tag,
    Text,
    VisuallyHidden,
  } from '@hina-ui/vue'
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
    class="flex min-h-20 items-center gap-3 rounded-xl px-3.5 py-3"
    :class="concealed ? undefined : 'hn-state-layer hn-interactive hn-press-lg'"
  >
    <Ripple v-if="!concealed" />
    <HikariImage
      v-if="!concealed"
      :src="item.character.image"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    >
      <template #error><VisuallyHidden /></template>
    </HikariImage>
    <Avatar v-else class="size-14! shrink-0" />

    <Stack gap="xs" class="min-w-0 flex-1">
      <Tag v-if="item.appearance?.hidden" tone="warning" class="self-start">含剧透</Tag>
      <Spoiler v-if="concealed" v-model:hidden="concealed" class="text-sm font-bold">
        {{ name }}
      </Spoiler>
      <NuxtLink v-else v-slot="{ href, navigate }" :to="`/characters/${item.character.id}`" custom>
        <Link
          :href="href ?? undefined"
          tone="neutral"
          :underline="false"
          class="truncate text-sm font-bold after:absolute after:inset-0"
          lang="ja"
          @click="navigate"
        >
          {{ name }}
        </Link>
      </NuxtLink>
      <Inline
        v-if="voices.length && !concealed"
        gap="xs"
        align="start"
        :wrap="false"
        class="relative z-10"
      >
        <Text as="span" size="xs" tone="faint" class="shrink-0">CV</Text>
        <Stack gap="none" class="min-w-0">
          <Text
            v-for="(voice, index) in voices"
            :key="index"
            as="span"
            size="xs"
            tone="muted"
            truncate
          >
            <NuxtLink
              v-if="voice.personId"
              v-slot="{ href, navigate }"
              :to="`/people/${voice.personId}`"
              custom
            >
              <Link
                :href="href ?? undefined"
                tone="neutral"
                :underline="false"
                class="hover:text-accent-text"
                lang="ja"
                @click="navigate"
              >
                {{ voice.name }}
              </Link>
            </NuxtLink>
            <template v-else>{{ voice.name }}</template>
            <Text v-if="voice.version" as="span" tone="faint" class="ms-1">{{
              voice.version
            }}</Text>
          </Text>
        </Stack>
      </Inline>
    </Stack>
  </Card>
</template>
