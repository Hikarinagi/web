<script setup lang="ts">
  import { Button, Inline, NumberFormat, Stack, Text, Time } from '@hina-ui/vue'
  import { Eye, Pencil } from '@lucide/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { useArticleOwnerActions } from '~/features/article/useArticleOwnerActions'

  const props = defineProps<{
    author: ArticlePageData['author']
    creator: NonNullable<ArticlePageData['article']['creator']>
    createdAt: string
    viewCount: number
    articleId: number
  }>()

  const auth = useAuthStore()
  const { edit } = useArticleOwnerActions()
  const isOwner = computed(() => auth.user?.id != null && auth.user.id === props.creator.id)
</script>

<template>
  <Inline gap="md">
    <Avatar :user="creator" card shape="circle" class="size-11! shrink-0" />
    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Inline gap="sm" class="text-sm">
        <UserName :user="creator" class="font-semibold text-fg" />
        <UserBadges :user="creator" />
      </Inline>
      <Inline gap="sm" class="text-xs text-muted">
        <Time :value="createdAt" format="date" />
        <Text as="span" size="xs" tone="muted">·</Text>
        <Inline as="span" gap="xs">
          <Eye class="size-3.5" />
          <NumberFormat :value="viewCount" />
        </Inline>
      </Inline>
    </Stack>
    <Button v-if="isOwner" variant="soft" tone="neutral" size="sm" @click="edit(articleId)">
      <template #icon><Pencil /></template>
      编辑
    </Button>
    <CommunityFollowButton
      v-else
      :user-id="creator.id"
      :initial-following="author?.is_following ?? false"
    />
  </Inline>
</template>
