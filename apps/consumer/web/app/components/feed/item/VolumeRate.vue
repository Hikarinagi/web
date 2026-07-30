<script setup lang="ts">
  import type { FeedItemByType } from '~/features/feed/feed'

  const props = defineProps<{ item: FeedItemByType<'light_novel_volume_rate'> }>()

  const volumeName = computed(
    () =>
      props.item.volume_ref.name_cn ||
      props.item.volume_ref.name ||
      `第 ${props.item.volume_ref.volume_number ?? '?'} 卷`,
  )
</script>

<template>
  <div class="flex flex-col gap-3">
    <p class="text-[15px] text-color">读完《{{ volumeName }}》</p>
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
