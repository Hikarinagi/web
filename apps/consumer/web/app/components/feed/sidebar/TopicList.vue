<script setup lang="ts">
  import { Inline, Link, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { SidebarTopic } from '~/features/feed/sidebar'

  defineProps<{ topics: SidebarTopic[] }>()
</script>

<template>
  <Stack gap="none" class="pb-1.5">
    <Link
      v-for="topic in topics"
      :key="topic.id"
      :as="NuxtLink"
      :to="`/topics/${topic.id}`"
      tone="neutral"
      class="hn-state-layer block hn-interactive px-(--hn-panel-p) py-2.5 hn-press-none"
    >
      <Ripple />
      <Inline gap="none" align="center" :wrap="false" class="gap-2.5">
        <Hash class="size-3.5 shrink-0 text-muted" />
        <Text as="span" size="xs" weight="medium" truncate class="min-w-0 flex-1">
          {{ topic.name }}
        </Text>
        <Tag tone="accent" size="sm" class="shrink-0 font-semibold">{{ topic.use_count }}</Tag>
      </Inline>
    </Link>
  </Stack>
</template>
