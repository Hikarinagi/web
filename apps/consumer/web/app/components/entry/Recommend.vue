<script setup lang="ts" generic="T extends { id: number }">
  import { Grid, Stack } from '@hina-ui/vue'
  import { markRecommended, recentWorks, visitorId } from '~/features/recommend/session'
  import type { RecommendKind } from '~/features/recommend/session'
  import type { HikariImageSource } from '~/utils/media/image'

  type RecommendPath = '/api/v3/galgames/{id}/recommendations'

  defineOptions({ name: 'EntryRecommend' })
  const props = defineProps<{
    kind: RecommendKind
    resource: 'galgames' | 'light-novels' | 'mangas'
    workId: number
    exclude: number[]
    ratio: '2/3' | '3/4'
    titleOf: (item: T) => string
    subOf: (item: T) => string
    coverOf: (item: T) => HikariImageSource
  }>()
  const shown = defineModel<boolean>('shown', { default: false })

  const items = ref([]) as Ref<T[]>
  const cursor = ref<number | null>(0)
  const loading = ref(false)
  const failed = ref(false)

  async function load() {
    if (loading.value || cursor.value === null) return
    loading.value = true
    failed.value = false
    try {
      const page = (await hikariRequest<RecommendPath, 'get'>(
        `/api/v3/${props.resource}/{id}/recommendations` as RecommendPath,
        {
          method: 'get',
          path: { id: props.workId },
          query: {
            cursor: cursor.value,
            visitor: visitorId(),
            recent: recentWorks(props.kind, props.workId),
            exclude: props.exclude,
          },
          toast: false,
        },
      )) as unknown as { items: T[]; next_cursor: number | null }
      items.value = [...items.value, ...page.items]
      cursor.value = page.next_cursor
      shown.value = items.value.length > 0
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  onMounted(load)
</script>

<template>
  <Stack
    v-if="items.length"
    gap="md"
    class="mx-auto w-full max-w-(--entry-container) px-4 pb-16 lg:px-6"
  >
    <EntrySectionHead id="recommend" title="你可能也会喜欢" />
    <Grid :cols="3" class="gap-x-4 gap-y-7 sm:grid-cols-4 lg:grid-cols-6">
      <BrowseWorkCard
        v-for="item in items"
        :key="item.id"
        :to="`/${resource}/${item.id}`"
        :title="titleOf(item)"
        :sub="subOf(item)"
        :cover="coverOf(item)"
        :ratio="ratio"
        plain-sub
        @click="markRecommended(kind, item.id)"
      />
    </Grid>
    <StreamTail
      :loading="loading"
      :failed="failed"
      :done="cursor === null"
      :has-items="false"
      @load="load"
    />
  </Stack>
</template>
