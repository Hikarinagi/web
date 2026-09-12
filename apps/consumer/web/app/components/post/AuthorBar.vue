<script setup lang="ts">
  import { Button, Inline, Stack, Time } from '@hina-ui/vue'
  import { Pencil } from '@lucide/vue'
  import type { PostPageData } from '~~/server/api/pages/posts/[id].get'
  import { usePostOwnerActions } from '~/features/post/usePostOwnerActions'

  const props = defineProps<{
    author: PostPageData['author']
    creator: NonNullable<PostPageData['post']['creator']>
    createdAt: string
    postId: number
  }>()

  const auth = useAuthStore()
  const { edit } = usePostOwnerActions()
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
      <Time :value="createdAt" format="relative" class="text-xs text-muted" />
    </Stack>
    <Button v-if="isOwner" variant="soft" tone="neutral" size="sm" @click="edit(postId)">
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
