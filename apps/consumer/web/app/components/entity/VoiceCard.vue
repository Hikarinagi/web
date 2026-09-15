<script setup lang="ts">
  import { Card, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTITY_FALLBACK_IMAGE, type VoiceCardItem } from '~/features/entity/entity'

  defineOptions({ name: 'EntityVoiceCard' })
  defineProps<{ item: VoiceCardItem }>()
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="item.to"
    :padded="false"
    class="group flex h-20 items-center gap-3 rounded-xl px-3.5 py-3 shadow-none transition-colors hover:border-line-strong"
  >
    <HikariImage
      :src="item.image?.src"
      :alt="item.name"
      class="size-14 shrink-0 rounded-full bg-subtle"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    />
    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Text size="sm" truncate class="font-bold transition-colors group-hover:text-accent-text">
        {{ item.name }}
      </Text>
      <Text v-if="item.sub" size="xs" tone="muted" truncate>{{ item.sub }}</Text>
    </Stack>
  </Card>
</template>
