<script setup lang="ts">
  import type { TopicPageData } from '~~/server/api/pages/topics/[id].get'

  defineOptions({ name: 'PageTopicDetail' })
  definePageMeta({ footer: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const { data } = await useHikariApiData<TopicPageData>(`/api/pages/topics/${id}`, { fatal: true })

  useHikariSeoMeta({
    title: () => (data.value ? [`#${data.value.topic.name}`, '话题'] : '话题'),
    description: () =>
      data.value
        ? [
            data.value.topic.description,
            `#${data.value.topic.name} 话题下的社区讨论、动态与相关作品。在 Hikarinagi 和大家一起参与 #${data.value.topic.name} 的讨论吧！`,
          ]
        : undefined,
  })
</script>

<template>
  <TopicDetail v-if="data" :initial="data" :topic-id="id" />
</template>
