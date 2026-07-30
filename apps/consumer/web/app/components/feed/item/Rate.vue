<script setup lang="ts">
  import type { FeedItemByType } from '~/features/feed/feed'

  defineProps<{
    item:
      | FeedItemByType<'galgame_rate'>
      | FeedItemByType<'light_novel_rate'>
      | FeedItemByType<'manga_rate'>
  }>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <FeedWorkRefCard :work-ref="item.work_ref" :score="item.rate" />
    <p
      v-if="item.rate_content"
      class="text-[15px] leading-relaxed wrap-anywhere whitespace-pre-wrap text-color"
    >
      <Spoiler v-if="item.is_spoiler">{{ item.rate_content }}</Spoiler>
      <template v-else>{{ item.rate_content }}</template>
    </p>
  </div>
</template>
