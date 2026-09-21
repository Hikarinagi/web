<script setup lang="ts">
  import { Spoiler, Stack, Text } from '@hina-ui/vue'
  import type { FeedItemByType } from '~/features/feed/feed'

  defineProps<{
    item:
      | FeedItemByType<'galgame_rate'>
      | FeedItemByType<'light_novel_rate'>
      | FeedItemByType<'manga_rate'>
  }>()
</script>

<template>
  <Stack gap="none" class="gap-3">
    <FeedWorkRefCard :work-ref="item.work_ref" :score="item.rate" />
    <Text v-if="item.rate_content" class="leading-relaxed wrap-anywhere whitespace-pre-wrap">
      <Spoiler v-if="item.is_spoiler">{{ item.rate_content }}</Spoiler>
      <template v-else>{{ item.rate_content }}</template>
    </Text>
  </Stack>
</template>
