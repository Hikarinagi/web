<script setup lang="ts">
  import type { BackendFeedItem } from '~/features/feed/feed'
  import { feedTypeLabel } from '~/features/feed/feed'
  import type { ReportBody } from '~/features/report/report'

  defineOptions({ name: 'FeedItemReport' })

  const props = defineProps<{ item: BackendFeedItem }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const title = computed(() => `举报此${feedTypeLabel(props.item)}`)

  async function submit(body: ReportBody) {
    switch (props.item.type) {
      case 'post':
        await hikariRequest<'/api/v3/posts/{id}/report', 'post'>('/api/v3/posts/{id}/report', {
          method: 'post',
          path: { id: props.item.id },
          body,
        })
        return
      case 'article':
        await hikariRequest<'/api/v3/articles/{id}/report', 'post'>(
          '/api/v3/articles/{id}/report',
          {
            method: 'post',
            path: { id: props.item.id },
            body,
          },
        )
        return
      case 'galgame_rate':
      case 'galgame_status':
        await hikariRequest<'/api/v3/galgames/{id}/rates/{rateId}/report', 'post'>(
          '/api/v3/galgames/{id}/rates/{rateId}/report',
          {
            method: 'post',
            path: { id: props.item.work_ref.id, rateId: props.item.id },
            body,
          },
        )
        return
      case 'light_novel_rate':
      case 'light_novel_status':
        await hikariRequest<'/api/v3/light-novels/{id}/rates/{rateId}/report', 'post'>(
          '/api/v3/light-novels/{id}/rates/{rateId}/report',
          {
            method: 'post',
            path: { id: props.item.work_ref.id, rateId: props.item.id },
            body,
          },
        )
        return
      case 'manga_rate':
      case 'manga_status':
        await hikariRequest<'/api/v3/mangas/{id}/rates/{rateId}/report', 'post'>(
          '/api/v3/mangas/{id}/rates/{rateId}/report',
          {
            method: 'post',
            path: { id: props.item.work_ref.id, rateId: props.item.id },
            body,
          },
        )
        return
      case 'light_novel_volume_rate':
        await hikariRequest<'/api/v3/light-novel-volumes/{id}/rates/{rateId}/report', 'post'>(
          '/api/v3/light-novel-volumes/{id}/rates/{rateId}/report',
          {
            method: 'post',
            path: { id: props.item.volume_ref.id, rateId: props.item.id },
            body,
          },
        )
    }
  }
</script>

<template>
  <ReportDialog v-model:visible="visible" :title="title" :submit="submit" />
</template>
