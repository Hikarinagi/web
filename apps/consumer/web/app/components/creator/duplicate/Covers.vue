<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { PUBLIC_PATH, type BackendDuplicateCandidate } from '~/features/creator/duplicates'

  defineProps<{ items: BackendDuplicateCandidate[] }>()
</script>

<template>
  <Inline gap="sm">
    <Card
      v-for="item in items"
      :key="item.id"
      :as="NuxtLink"
      :to="`${PUBLIC_PATH[item.resource_type] ?? '/'}${item.id}`"
      target="_blank"
      :padded="false"
      class="hn-state-layer w-24 hn-interactive p-1.5 hn-press-lg"
    >
      <Ripple />
      <Stack gap="xs">
        <HikariImage
          :src="item.cover ?? ''"
          alt=""
          preset="small"
          class="aspect-3/4 w-full rounded bg-subtle"
          image-class="size-full object-cover"
        >
          <template #empty />
          <template #error />
        </HikariImage>
        <Text as="span" size="xs" truncate>{{ item.subtitle || item.title }}</Text>
      </Stack>
    </Card>
  </Inline>
</template>
