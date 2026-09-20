<script setup lang="ts">
  import { Eye, Pencil } from '@lucide/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { useArticleOwnerActions } from '~/features/article/useArticleOwnerActions'
  import { TimeFormatEnum, datePartFormat } from '~/utils/time-format'

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

  const dateLabel = computed(() => datePartFormat(props.createdAt, TimeFormatEnum.YYYY_M_D_CN))
  const views = computed(() => String(props.viewCount).replace(/\B(?=(\d{3})+(?!\d))/g, ','))
</script>

<template>
  <div class="flex items-center gap-3">
    <Avatar :user="creator" card shape="circle" class="size-11! shrink-0" />
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <div class="flex items-center gap-1.5">
        <UserName :user="creator" class="text-sm font-semibold text-color" />
        <UserBadges :user="creator" />
      </div>
      <div class="flex items-center gap-2 text-[13px] text-muted-color">
        <time :datetime="createdAt">{{ dateLabel }}</time>
        <span>·</span>
        <span class="inline-flex items-center gap-1">
          <Eye class="size-3.5" />
          {{ views }}
        </span>
      </div>
    </div>
    <Button v-if="isOwner" label="编辑" size="small" severity="secondary" @click="edit(articleId)">
      <template #icon><Pencil class="size-4" /></template>
    </Button>
    <CommunityFollowButton
      v-else
      :user-id="creator.id"
      :initial-following="author?.is_following ?? false"
    />
  </div>
</template>
