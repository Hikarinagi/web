<script setup lang="ts">
  import { Heading, Inline, Stack } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import type { BackendCheckSource } from '~/features/creator/check'

  defineProps<{ sources: BackendCheckSource[] }>()
</script>

<template>
  <Stack v-if="sources.length" gap="xs">
    <Heading :level="3" size="sm">来源</Heading>
    <Stack as="ul" gap="xs">
      <Inline
        v-for="source in sources"
        :key="source.url ?? source.ref ?? ''"
        as="li"
        gap="sm"
        align="center"
      >
        <ExternalLink class="size-4 shrink-0 text-muted" aria-hidden="true" />
        <CreatorReviewCheckSource :source="source" long />
      </Inline>
    </Stack>
  </Stack>
</template>
