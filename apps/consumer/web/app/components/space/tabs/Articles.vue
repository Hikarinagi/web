<script setup lang="ts">
  import { SPACE_CONTENT_PAGE_SIZE, type SpaceContentPage } from '~/features/space/space'
  import { usePagedList } from '~/features/space/usePagedList'

  defineOptions({ name: 'SpaceTabsArticles' })

  const props = defineProps<{ userId: number; contents: SpaceContentPage }>()

  const { list, pending, loadPage } = usePagedList(props.contents, page =>
    hikariRequest('/api/v3/user/{id}/contents', {
      path: { id: props.userId },
      query: { page, page_size: SPACE_CONTENT_PAGE_SIZE, content_type: 'article' },
    }),
  )
</script>

<template>
  <div class="flex flex-col gap-4">
    <LoadingOverlay :loading="pending">
      <SpaceContentList :items="list.items" empty-text="还没有发布文章" />
    </LoadingOverlay>
    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </div>
</template>
