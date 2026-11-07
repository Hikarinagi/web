<script setup lang="ts">
  import { Button as HnButton, Card, Inline, Link, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { yearOf, type VoiceRole } from '~/features/person/works'

  defineOptions({ name: 'PersonWorksVoices' })
  const props = defineProps<{ voices: VoiceRole[]; descending: boolean }>()

  const COLLAPSED = 24
  const all = ref(false)
  const sorted = computed(() =>
    [...props.voices].sort((a, b) => {
      const order = (a.works[0]?.release_date ?? '').localeCompare(b.works[0]?.release_date ?? '')
      return props.descending ? -order : order
    }),
  )
  const shown = computed(() => (all.value ? sorted.value : sorted.value.slice(0, COLLAPSED)))
</script>

<template>
  <Stack gap="md">
    <SimpleGrid min="16rem" gap="sm">
      <Card v-for="voice in shown" :key="voice.id" :padded="false">
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
    <HnButton
      v-if="voices.length > COLLAPSED"
      variant="soft"
      tone="neutral"
      class="self-center"
      @click="all = !all"
    >
      {{ all ? '收起' : `显示全部 ${voices.length} 个角色` }}
    </HnButton>
  </Stack>
</template>
