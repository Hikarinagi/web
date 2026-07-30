<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceSidebar' })

  const props = defineProps<{
    statistics: SpacePageData['statistics']
    going: SpacePageData['going']
    status: SpacePageData['status']
    isSelf: boolean
  }>()

  const favoriteTotal = computed(
    () =>
      props.statistics.favorite_galgame_count +
      props.statistics.favorite_light_novel_count +
      props.statistics.favorite_article_count +
      props.statistics.favorite_post_count,
  )

  const editedTotal = computed(
    () =>
      props.statistics.edited_galgame_count +
      props.statistics.edited_light_novel_count +
      props.statistics.edited_light_novel_volume_count +
      props.statistics.edited_person_count +
      props.statistics.edited_character_count +
      props.statistics.edited_producer_count,
  )

  const infoRows = computed(() => [
    { label: '加入天数', value: props.statistics.join_days },
    { label: '发布文章', value: props.statistics.created_article_count },
    { label: '发布动态', value: props.statistics.created_post_count },
    { label: '游玩作品', value: props.statistics.played_galgame_count },
    { label: '看过作品', value: props.statistics.read_light_novel_count },
    { label: '收藏作品', value: favoriteTotal.value },
    { label: 'Wiki 编辑', value: editedTotal.value },
  ])
</script>

<template>
  <div class="flex flex-col gap-5">
    <SpaceSidebarCheckIn v-if="isSelf && status" :status="status" />

    <FeedSidebarPanel title="资料">
      <dl class="flex flex-col gap-3 px-4 pb-4">
        <div
          v-for="row in infoRows"
          :key="row.label"
          class="flex items-center justify-between text-sm"
        >
          <dt class="text-muted-color">{{ row.label }}</dt>
          <dd class="font-semibold text-color">{{ row.value }}</dd>
        </div>
      </dl>
    </FeedSidebarPanel>

    <FeedSidebarPanel
      v-if="going.items.length"
      title="正在玩 · 正在读"
      :count="going.meta.total_items"
    >
      <FeedSidebarStatusBoard :items="going.items" />
    </FeedSidebarPanel>
  </div>
</template>
