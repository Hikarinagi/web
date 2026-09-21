<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { feedItemBlocksNsfw, feedItemPath, type FeedRow } from '~/features/feed/feed'

  const props = defineProps<{ row: FeedRow; hideName?: boolean }>()

  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(
    () => props.row.kind === 'item' && shouldBlockNsfw(feedItemBlocksNsfw(props.row.item)),
  )
  const detailTo = computed(() => (props.row.kind === 'item' ? feedItemPath(props.row.item) : null))
  const detailLabel = computed(() => {
    if (props.row.kind !== 'item') return '查看'
    const item = props.row.item
    if (item.type === 'post') return item.title || '查看图文'
    if (item.type === 'article') return item.title || '查看文章'
    return '查看评分'
  })
  const hotComment = computed(() =>
    props.row.kind === 'item' &&
    (props.row.item.type === 'post' || props.row.item.type === 'article')
      ? props.row.item.hot_comment
      : null,
  )
  const hotCommentTo = computed(() => {
    if (props.row.kind !== 'item' || !hotComment.value) return null
    const item = props.row.item
    const base =
      item.type === 'post'
        ? `/posts/${item.id}`
        : item.type === 'article'
          ? `/articles/${item.id}`
          : null
    return base ? `${base}?comment=${hotComment.value.id}#comment-${hotComment.value.id}` : null
  })
</script>

<template>
  <Stack
    v-if="!blocked"
    as="article"
    gap="sm"
    :class="
      cn(
        'relative -mx-2 min-w-0 px-2 py-4.5',
        detailTo && 'hn-state-layer hn-interactive hn-press-none',
      )
    "
  >
    <NuxtLink v-if="detailTo" :to="detailTo" class="absolute inset-0" :aria-label="detailLabel" />
    <FeedItemGroup v-if="row.kind === 'group'" :group="row.group" :hide-name="hideName" />
    <template v-else>
      <FeedItemHeader :item="row.item" :hide-name="hideName" />
      <FeedItemPost v-if="row.item.type === 'post'" :item="row.item" />
      <FeedItemArticle v-else-if="row.item.type === 'article'" :item="row.item" />
      <FeedItemRate
        v-else-if="
          row.item.type === 'galgame_rate' ||
          row.item.type === 'light_novel_rate' ||
          row.item.type === 'manga_rate'
        "
        :item="row.item"
      />
      <FeedItemStatus
        v-else-if="
          row.item.type === 'galgame_status' ||
          row.item.type === 'light_novel_status' ||
          row.item.type === 'manga_status'
        "
        :item="row.item"
      />
      <FeedItemVolumeRate
        v-else-if="row.item.type === 'light_novel_volume_rate'"
        :item="row.item"
      />
      <FeedItemActionBar :item="row.item" />
      <FeedItemHotComment
        v-if="hotComment && hotCommentTo"
        :comment="hotComment"
        :to="hotCommentTo"
      />
    </template>
  </Stack>
</template>
