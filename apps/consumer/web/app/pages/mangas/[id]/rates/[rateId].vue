<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { commentFocusId } from '~/features/comment/comment'
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import { MANGA_STATUS_LABEL } from '~/features/manga/rate'
  import { ratePath } from '~/features/rate/permalink'
  import { MANGA_STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'PageMangaRateDetail' })
  definePageMeta({ footer: false, bottomBar: false, container: 'full' })

  const route = useRoute()
  const mangaId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const rateId = Number(
    Array.isArray(route.params.rateId) ? route.params.rateId[0] : route.params.rateId,
  )
  const focusComment = commentFocusId(route.query.comment)
  const { data } = await useHikariApiData(
    focusComment != null
      ? `/api/pages/mangas/${mangaId}/rates/${rateId}?comment=${focusComment}`
      : `/api/pages/mangas/${mangaId}/rates/${rateId}`,
    { fatal: true },
  )
  useNsfwDetailGate(() => data.value?.rate.work_ref.nsfw)

  const shareTo = ratePath('MANGA', mangaId, rateId)
  const status = computed(() => data.value?.rate.status ?? null)

  useHikariSeoMeta({
    title: () =>
      data.value
        ? `${displayName(data.value.rate.rater)} 对《${data.value.rate.work_ref.title}》的评分`
        : '评分',
    description: () => data.value?.rate.rate_content || undefined,
  })

  if (data.value) {
    const rate = data.value.rate
    provide(COMMENT_DETAIL_ACTIONS_KEY, {
      like: {
        kind: 'manga_rate',
        id: rate.id,
        count: rate.like_count,
        liked: rate.my_value === 1,
        parentId: mangaId,
      },
      favorite: {
        type: 'manga',
        id: mangaId,
        favorited: data.value.favorite?.favorited ?? false,
        pickerTitle: `将「${rate.work_ref.title}」添加到收藏夹`,
      },
      shareTo,
    })
  }
</script>

<template>
  <FeedPageShell v-if="data">
    <Stack as="article" gap="lg">
      <RateDetailBody
        :rate="data.rate"
        :following="data.author?.is_following ?? false"
        :dimensions="[]"
        :status-label="status ? MANGA_STATUS_LABEL[status] : null"
        :status-icon="status ? MANGA_STATUS_ICON[status] : null"
      />

      <RateDetailActionBar
        kind="manga_rate"
        :rate-id="data.rate.id"
        :work-id="mangaId"
        :rater-id="data.rate.rater.id"
        :like-count="data.rate.like_count"
        :my-value="data.rate.my_value"
        favorite-type="manga"
        :favorite-id="mangaId"
        :favorited="data.favorite?.favorited ?? false"
        :picker-title="`将「${data.rate.work_ref.title}」添加到收藏夹`"
        :share-to="shareTo"
      />

      <CommentSection
        target-type="manga_rate"
        :target-id="data.rate.id"
        :initial="data.comments"
        :author-id="data.rate.rater.id"
      />
    </Stack>

    <template #sidebar>
      <FeedSidebar :data="data.sidebar" />
    </template>
  </FeedPageShell>
</template>
