<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { commentFocusId } from '~/features/comment/comment'
  import { COMMENT_DETAIL_ACTIONS_KEY } from '~/features/comment/detailBar'
  import {
    LIGHT_NOVEL_RATE_DIMENSIONS,
    LIGHT_NOVEL_STATUS_LABEL,
  } from '~/features/light-novel/rate'
  import { pickRateDimensions } from '~/features/rate/dimensions'
  import { ratePath } from '~/features/rate/permalink'
  import { LIGHT_NOVEL_STATUS_ICON } from '~/features/rate/status-icon'

  defineOptions({ name: 'PageLightNovelRateDetail' })
  definePageMeta({ footer: false, bottomBar: false, container: 'full' })

  const route = useRoute()
  const lightNovelId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const rateId = Number(
    Array.isArray(route.params.rateId) ? route.params.rateId[0] : route.params.rateId,
  )
  const focusComment = commentFocusId(route.query.comment)
  const { data } = await useHikariApiData(
    focusComment != null
      ? `/api/pages/light-novels/${lightNovelId}/rates/${rateId}?comment=${focusComment}`
      : `/api/pages/light-novels/${lightNovelId}/rates/${rateId}`,
    { fatal: true },
  )
  useNsfwDetailGate(() => data.value?.rate.work_ref.nsfw)

  const shareTo = ratePath('LIGHT_NOVEL', lightNovelId, rateId)
  const dimensions = computed(() =>
    data.value ? pickRateDimensions(data.value.rate, LIGHT_NOVEL_RATE_DIMENSIONS) : [],
  )
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
        kind: 'light_novel_rate',
        id: rate.id,
        count: rate.like_count,
        liked: rate.my_value === 1,
        parentId: lightNovelId,
      },
      favorite: {
        type: 'light_novel',
        id: lightNovelId,
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
        :dimensions="dimensions"
        :status-label="status ? LIGHT_NOVEL_STATUS_LABEL[status] : null"
        :status-icon="status ? LIGHT_NOVEL_STATUS_ICON[status] : null"
      />

      <RateDetailActionBar
        kind="light_novel_rate"
        :rate-id="data.rate.id"
        :work-id="lightNovelId"
        :rater-id="data.rate.rater.id"
        :like-count="data.rate.like_count"
        :my-value="data.rate.my_value"
        favorite-type="light_novel"
        :favorite-id="lightNovelId"
        :favorited="data.favorite?.favorited ?? false"
        :picker-title="`将「${data.rate.work_ref.title}」添加到收藏夹`"
        :share-to="shareTo"
      />

      <CommentSection
        target-type="light_novel_rate"
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
