<script setup lang="ts">
  import { Button, DataList, Heading, SearchInput, Stack, Text } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import type { NovelTargetVolume } from '~/features/contribute/novel-target'
  import { useVolumeSearch } from '~/features/contribute/useVolumeSearch'
  import { PROJECT_COPY, volumeLabel, volumeNote } from '~/features/contribute/wanted'
  import { topVotedMedia } from '~/utils/media/image'

  const props = defineProps<{
    volumes: ContributePageData['volumes']
    target: ContributePageData['target']
    title?: string
  }>()

  type Mode = 'ENTRY' | 'TRANSLATION'
  type Item = ContributePageData['volumes'][number] | NonNullable<ContributePageData['target']>

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useVolumeSearch()
  const list = useTemplateRef<{ $el: HTMLElement }>('list')
  const searching = computed(() => !!search.value.trim())
  const items = computed<Item[]>(() => {
    if (searching.value) return results.value
    const target = props.target
    return target
      ? [target, ...props.volumes.filter(volume => volume.id !== target.id)]
      : props.volumes
  })
  const uploadId = ref<number | null>(null)
  const uploadOpen = ref(false)
  const starting = shallowRef<{ volume: NovelTargetVolume; mode: Mode } | null>(null)
  const startOpen = ref(false)

  const series = (item: Item) => item.series.name_cn || item.series.name
  const note = (item: Item) =>
    'readers' in item ? volumeNote(item) : item.has_epub ? '已收录' : null
  const projects = (item: Item) => ('projects' in item ? item.projects : [])
  const listed = (item: Item) => 'has_epub' in item && item.has_epub
  const taken = (item: Item, mode: Mode) => projects(item).some(project => project.mode === mode)
  const pinned = (item: Item) =>
    !searching.value && item.id === props.target?.id ? 'rounded-md bg-accent-soft' : undefined

  function upload(volume: NovelTargetVolume) {
    if (!requireLogin()) return
    uploadId.value = volume.id
    uploadOpen.value = true
  }

  function start(volume: NovelTargetVolume, mode: Mode) {
    if (!requireLogin()) return
    starting.value = { volume, mode }
    startOpen.value = true
  }

  onMounted(() => {
    if (props.target) list.value?.$el.scrollIntoView({ block: 'start' })
  })
</script>

<template>
  <Stack gap="sm">
    <Heading v-if="title" :level="3">{{ title }}</Heading>
    <DataList
      ref="list"
      :items="items"
      item-key="id"
      :item-title="series"
      :item-description="volumeLabel"
      :item-class="pinned"
      :media-ratio="11 / 16"
      :loading="searching && loading"
      :empty-text="searching ? '未找到分卷' : '没有内容'"
      :label="title ?? '正在征集的分卷'"
      pagination
      :page-size="20"
    >
      <template #header>
        <SearchInput
          v-model="search"
          size="sm"
          placeholder="搜索分卷"
          aria-label="搜索分卷"
          class="w-full max-w-xs"
        />
      </template>
      <template #media="{ item }">
        <HikariImage
          :src="topVotedMedia(item.covers)?.src ?? null"
          :alt="series(item)"
          preset="small"
          class="size-full"
          image-class="object-cover"
        />
      </template>
      <template #meta="{ item }">
        <Stack gap="none">
          <Text v-if="note(item)" size="xs" tone="muted">{{ note(item) }}</Text>
          <Text v-for="project in projects(item)" :key="project.mode" size="xs" tone="muted">
            <UserName :user="project.owner" :handle="false" class="inline-flex" />
            {{ PROJECT_COPY[project.mode] }}
          </Text>
        </Stack>
      </template>
      <template #actions="{ item }">
        <template v-if="!listed(item)">
          <Button variant="ghost" size="sm" @click="upload(item)">上传</Button>
          <Button
            v-if="!taken(item, 'ENTRY')"
            variant="ghost"
            size="sm"
            @click="start(item, 'ENTRY')"
          >
            录入
          </Button>
          <Button
            v-if="!taken(item, 'TRANSLATION')"
            variant="ghost"
            size="sm"
            @click="start(item, 'TRANSLATION')"
          >
            翻译
          </Button>
        </template>
      </template>
    </DataList>

    <LightNovelVolumeEpubContributeDialog
      v-if="uploadId"
      :key="uploadId"
      v-model:visible="uploadOpen"
      :volume-id="uploadId"
    />
    <ContributeNovelStartDialog
      v-if="starting"
      v-model:open="startOpen"
      :volume="starting.volume"
      :mode="starting.mode"
    />
  </Stack>
</template>
