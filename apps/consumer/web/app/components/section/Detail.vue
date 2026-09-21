<script setup lang="ts">
  import { Center, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { SectionPageData } from '~~/server/api/pages/sections/[id].get'
  import { sectionFeedSource } from '~/features/feed/sources'

  defineOptions({ name: 'SectionDetail' })

  const props = defineProps<{ initial: SectionPageData; sectionId: number }>()
  const section = computed(() => props.initial.section)
  const source = sectionFeedSource(props.sectionId, () => props.initial.feed)
</script>

<template>
  <FeedPageShell>
    <Inline as="header" gap="md" align="start" :wrap="false" class="mb-4">
      <Stack gap="none" class="size-12 shrink-0 overflow-hidden rounded-xl">
        <HikariImage
          v-if="section.icon || section.cover"
          :src="section.icon ?? section.cover"
          alt=""
          image-class="size-full object-cover"
        />
        <Center
          v-else
          class="size-full text-lg font-bold text-white"
          :style="{ backgroundColor: section.color ?? 'var(--hn-accent)' }"
        >
          {{ section.name.slice(0, 1) }}
        </Center>
      </Stack>

      <Stack gap="none" class="min-w-0 flex-1 gap-1.5">
        <Heading :level="1" size="2xl" class="font-bold wrap-anywhere">{{ section.name }}</Heading>
        <Inline gap="sm" align="center" :wrap="false">
          <Text as="span" size="xs" tone="muted">{{ section.use_count }} 篇内容</Text>
          <Text as="span" size="xs" tone="muted">·</Text>
          <Text as="span" size="xs" tone="muted">{{ section.follow_count }} 关注</Text>
        </Inline>
        <Text v-if="section.description" as="p" size="sm" tone="muted" class="leading-relaxed">
          {{ section.description }}
        </Text>
      </Stack>

      <FeedFollowButton
        :id="section.id"
        kind="section"
        :initial-following="section.followed"
        class="mt-1 shrink-0"
      />
    </Inline>

    <FeedComposer :section-id="section.id" class="mb-4" />
    <FeedList :source="source" />

    <template #sidebar>
      <FeedSidebar :data="initial.sidebar" />
    </template>
  </FeedPageShell>
</template>
