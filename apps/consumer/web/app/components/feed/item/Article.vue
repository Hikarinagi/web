<script setup lang="ts">
  import { Hash } from '@lucide/vue'
  import type { FeedItemByType } from '~/features/feed/feed'

  const props = defineProps<{ item: FeedItemByType<'article'> }>()

  const to = computed(() => `/articles/${props.item.id}`)
  const coverSrc = computed(() => props.item.cover?.src ?? props.item.first_image ?? null)
  const coverProcessing = { width: 720, height: 360, quality: 82, fit: 'cover' as const }
</script>

<template>
  <div class="flex flex-col gap-3">
    <NuxtLink :to="to" class="group w-fit">
      <p
        class="text-base leading-snug font-semibold text-color transition-colors group-hover:text-primary"
      >
        {{ item.title }}
      </p>
    </NuxtLink>

    <NuxtLink
      v-if="coverSrc"
      :to="to"
      class="block overflow-hidden rounded-lg border border-surface-200 dark:border-surface-800"
    >
      <HikariImage
        :src="coverSrc"
        alt=""
        class="aspect-2/1 w-full"
        image-class="size-full object-cover"
        :processing="coverProcessing"
      />
    </NuxtLink>

    <FeedWorkRefCard
      v-if="item.is_review && item.review_work"
      :work-ref="item.review_work"
      :score="item.review_rate"
    />
    <template v-else>
      <FeedWorkRefCard v-for="workRef in item.work_refs" :key="workRef.id" :work-ref="workRef" />
    </template>

    <NuxtLink
      v-if="item.excerpt"
      :to="to"
      class="line-clamp-3 text-[15px] leading-relaxed text-muted-color transition-colors hover:text-color"
    >
      {{ item.excerpt }}
    </NuxtLink>

    <div
      v-if="item.is_review && item.topics.length"
      class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
    >
      <NuxtLink
        v-for="t in item.topics"
        :key="t.topic.id"
        :to="`/topics/${t.topic.id}`"
        class="inline-flex items-center gap-0.5 text-primary no-underline transition-colors duration-150 hover:text-primary-600"
      >
        <Hash class="size-3.5" />
        {{ t.topic.name }}
      </NuxtLink>
    </div>

    <div v-if="item.poll" class="relative z-1">
      <HikariContentNodesPollCard :poll="item.poll" />
    </div>
  </div>
</template>
