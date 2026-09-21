<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  const props = defineProps<{
    author: ArticlePageData['author']
    creator: NonNullable<ArticlePageData['article']['creator']>
  }>()

  const intro = computed(() => props.author?.signature || props.author?.bio || '')
</script>

<template>
  <Card>
    <Inline gap="md" align="center" :wrap="false">
      <Avatar :user="creator" card class="size-11! shrink-0" />
      <Stack gap="none" class="min-w-0 flex-1">
        <UserName :user="creator" class="text-sm font-semibold text-fg" />
        <Text v-if="intro" size="xs" tone="muted" class="line-clamp-2">{{ intro }}</Text>
      </Stack>
      <CommunityFollowButton
        :user-id="creator.id"
        :initial-following="author?.is_following ?? false"
      />
    </Inline>
  </Card>
</template>
