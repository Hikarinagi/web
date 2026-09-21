<script setup lang="ts">
  import { Spoiler, Stack, Text } from '@hina-ui/vue'
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
  <Stack gap="none" class="gap-3">
    <Text>读完《{{ volumeName }}》</Text>
    <FeedWorkRefCard :work-ref="item.work_ref" :score="item.rate" />
    <Text v-if="item.rate_content" class="leading-relaxed wrap-anywhere whitespace-pre-wrap">
      <Spoiler v-if="item.is_spoiler">{{ item.rate_content }}</Spoiler>
      <template v-else>{{ item.rate_content }}</template>
    </Text>
  </Stack>
</template>
