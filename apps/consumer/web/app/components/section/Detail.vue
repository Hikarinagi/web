<script setup lang="ts">
  import type { SectionPageData } from '~~/server/api/pages/sections/[id].get'
  import { sectionFeedSource } from '~/features/feed/sources'

  defineOptions({ name: 'SectionDetail' })

  const props = defineProps<{ initial: SectionPageData; sectionId: number }>()
  const section = computed(() => props.initial.section)
  const source = sectionFeedSource(props.sectionId, () => props.initial.feed)
</script>

<template>
  <FeedPageShell>
    <template #top>
      <header class="flex w-full items-start gap-3 px-4 sm:px-0">
        <div class="size-12 shrink-0 overflow-hidden rounded-xl">
          <HikariImage
            v-if="section.icon || section.cover"
            :src="section.icon ?? section.cover"
            alt=""
            image-class="size-full object-cover"
          />
          <div
            v-else
            class="flex size-full items-center justify-center text-lg font-bold text-white"
            :style="{ backgroundColor: section.color ?? 'var(--p-primary-500)' }"
          >
            {{ section.name.slice(0, 1) }}
          </div>
        </div>
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 class="text-2xl font-bold wrap-anywhere text-color">{{ section.name }}</h1>
          <div class="flex items-center gap-2 text-xs text-muted-color">
            <span>{{ section.use_count }} 篇内容</span>
            <span>·</span>
            <span>{{ section.follow_count }} 关注</span>
          </div>
          <p v-if="section.description" class="text-sm leading-relaxed text-muted-color">
            {{ section.description }}
          </p>
        </div>
        <FeedFollowButton
          :id="section.id"
          kind="section"
          :initial-following="section.followed"
          class="mt-1"
        />
      </header>
    </template>

    <FeedComposer :section-id="section.id" class="mb-4" />
    <FeedList :source="source" />

    <template #sidebar>
      <FeedSidebar :data="initial.sidebar" />
    </template>
  </FeedPageShell>
</template>
