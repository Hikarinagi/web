<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { Hash } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { FeedItemByType } from '~/features/feed/feed'

  const props = defineProps<{ item: FeedItemByType<'article'> }>()

  const cover = computed(() => props.item.cover ?? props.item.first_image ?? null)
  const coverProcessing = { width: 720, quality: 82, fit: 'cover' as const }
</script>

<template>
  <Stack gap="none" class="gap-3">
    <Text as="p" weight="semibold" class="leading-snug">{{ item.title }}</Text>

    <Stack v-if="cover" gap="none" class="overflow-hidden rounded-lg border border-line">
      <HikariImage
        :src="cover"
        alt=""
        class="aspect-2/1 w-full"
        image-class="size-full object-cover"
        :processing="coverProcessing"
        preview
      />
    </Stack>

    <FeedWorkRefCard
      v-if="item.is_review && item.review_work"
      :work-ref="item.review_work"
      :score="item.review_rate"
    />
    <template v-else>
      <FeedWorkRefCard v-for="workRef in item.work_refs" :key="workRef.id" :work-ref="workRef" />
    </template>

    <Text v-if="item.excerpt" as="p" tone="muted" class="line-clamp-3 leading-relaxed">
      {{ item.excerpt }}
    </Text>

    <Inline
      v-if="item.is_review && item.topics.length"
      gap="none"
      align="center"
      class="relative z-1 gap-x-2 gap-y-1 text-sm"
    >
      <Link
        v-for="t in item.topics"
        :key="t.topic.id"
        :as="NuxtLink"
        :to="`/topics/${t.topic.id}`"
        class="inline-flex items-center gap-0.5"
      >
        <Hash class="size-3.5" />
        {{ t.topic.name }}
      </Link>
    </Inline>

    <Stack v-if="item.poll" gap="none" class="relative z-1">
      <HikariContentNodesPollCard :poll="item.poll" />
    </Stack>
  </Stack>
</template>
