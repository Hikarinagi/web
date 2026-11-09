<script setup lang="ts">
  import { Card, Inline, Link, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { yearOf, type VoiceRole } from '~/features/person/works'

  defineOptions({ name: 'PersonWorksVoices' })
  defineProps<{ voices: VoiceRole[] }>()
</script>

<template>
  <SimpleGrid min="16rem" gap="sm">
    <Card v-for="voice in voices" :key="voice.id" :padded="false">
      <Inline gap="md" align="center" :wrap="false" class="p-2">
        <HikariImage
          :src="voice.image"
          :alt="voice.name"
          :ratio="1"
          :processing="{ gravity: 'face' }"
          preset="thumbnail"
          :fallback-src="ENTITY_FALLBACK_IMAGE"
          image-class="object-cover object-top"
          class="w-14 shrink-0 overflow-hidden rounded-md bg-white"
        />
        <Stack gap="none" class="min-w-0">
          <Link
            :as="NuxtLink"
            :to="`/characters/${voice.id}`"
            tone="neutral"
            class="truncate font-medium"
            lang="ja"
          >
            {{ voice.name }}
          </Link>
          <Link
            v-if="voice.works[0]"
            :as="NuxtLink"
            :to="`/galgames/${voice.works[0].id}`"
            tone="neutral"
            class="truncate text-sm text-muted hover:text-fg"
          >
            {{ voice.works[0].trans_title || voice.works[0].origin_title }}
          </Link>
          <Inline gap="sm" :wrap="false">
            <Text size="xs" tone="muted" class="tabular-nums">
              {{ yearOf(voice.works[0]?.release_date) }}
            </Text>
            <Text v-if="voice.works.length > 1" size="xs" tone="muted" class="tabular-nums">
              另有 {{ voice.works.length - 1 }} 部
            </Text>
          </Inline>
        </Stack>
      </Inline>
    </Card>
  </SimpleGrid>
</template>
