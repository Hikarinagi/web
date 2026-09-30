<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useVolumeSearch } from '~/features/contribute/useVolumeSearch'
  import { PROJECT_COPY, volumeLabel, volumeNote } from '~/features/contribute/wanted'
  import { topVotedMedia } from '~/utils/media/image'

  const props = defineProps<{
    volumes: ContributePageData['volumes']
    target: ContributePageData['target']
    title?: string
  }>()

  type Item = ContributePageData['volumes'][number] | NonNullable<ContributePageData['target']>

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useVolumeSearch()
  const board = useTemplateRef<{ $el: HTMLElement }>('board')
  const searching = computed(() => !!search.value.trim())
  const items = computed<Item[]>(() => {
    if (searching.value) return results.value
    const target = props.target
    return target
      ? [target, ...props.volumes.filter(volume => volume.id !== target.id)]
      : props.volumes
  })
  const volumeId = ref<number | null>(null)
  const open = ref(false)

  const series = (item: Item) => item.series.name_cn || item.series.name
  const projects = (item: Item) => ('projects' in item ? item.projects : [])
  const listed = (item: Item) => 'has_epub' in item && item.has_epub

  function pick(item: Item) {
    if (listed(item) || !requireLogin()) return
    volumeId.value = item.id
    open.value = true
  }

  onMounted(() => {
    if (props.target) board.value?.$el.scrollIntoView({ block: 'center' })
  })
</script>

<template>
  <ContributeWantedBoard
    ref="board"
    v-model:search="search"
    :items="items"
    :item-key="item => item.id"
    :title="title"
    placeholder="搜索分卷"
    :empty-text="searching ? '未找到分卷' : '没有内容'"
    :loading="loading"
  >
    <template #item="{ item }">
      <ContributeWantedItem
        :title="series(item)"
        :subtitle="volumeLabel(item)"
        :cover="topVotedMedia(item.covers)?.src"
        :to="listed(item) ? `/light-novel-volumes/${item.id}` : undefined"
        :pinned="!searching && item.id === target?.id"
        @click="pick(item)"
      >
        <Text v-if="listed(item)" as="span" size="xs" tone="muted">已收录</Text>
        <Text v-else-if="'readers' in item" as="span" size="xs" tone="muted" truncate>
          {{ volumeNote(item) }}
        </Text>
        <Text
          v-for="project in projects(item)"
          :key="project.mode"
          as="span"
          size="xs"
          tone="muted"
          truncate
        >
          <UserName :user="project.owner" :handle="false" class="inline-flex" />
          {{ PROJECT_COPY[project.mode] }}
        </Text>
      </ContributeWantedItem>
    </template>
  </ContributeWantedBoard>
  <LightNovelVolumeContributeDialog
    v-if="volumeId"
    :key="volumeId"
    v-model:open="open"
    :volume-id="volumeId"
  />
</template>
