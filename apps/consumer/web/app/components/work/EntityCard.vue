<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'

  defineOptions({ name: 'WorkEntityCard' })
  withDefaults(
    defineProps<{
      to: string
      name: string
      meta: string
      image?: string | null
      original?: string
    }>(),
    { image: null, original: '' },
  )
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="to"
    :padded="false"
    class="hn-state-layer flex h-20 hn-interactive items-center gap-3 rounded-xl px-3.5 py-3 hn-press-lg"
  >
    <Ripple />

    <HikariImage
      :src="image ?? undefined"
      :alt="name"
      class="size-14 shrink-0 rounded-full"
      image-class="object-cover object-top"
      :processing="{ gravity: 'face' }"
      preset="thumbnail"
      :fallback-src="ENTITY_FALLBACK_IMAGE"
    >
      <template #error><VisuallyHidden /></template>
    </HikariImage>

    <Stack gap="xs" class="min-w-0 flex-1">
      <Text as="p" size="sm" truncate class="font-bold">{{ name }}</Text>
      <Inline gap="none" align="center" :wrap="false" class="min-w-0 gap-1.5">
        <Text v-if="original" as="span" size="xs" tone="muted" truncate class="min-w-0">
          {{ original }}
        </Text>
        <Text v-if="original" as="span" size="xs" tone="muted" class="shrink-0">·</Text>
        <Text as="span" size="xs" tone="muted" class="shrink-0">{{ meta }}</Text>
      </Inline>
    </Stack>
  </Card>
</template>
