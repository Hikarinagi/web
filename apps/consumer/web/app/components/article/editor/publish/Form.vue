<script setup lang="ts">
  import { Hash, ImagePlus, X } from '@lucide/vue'
  import type Popover from 'primevue/popover'
  import { useTopics, type TopicOption } from '~/components/topic/useTopics'
  import type { ArticleEditorHost } from '../composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishForm' })

  const props = defineProps<{ host: ArticleEditorHost }>()
  const emit = defineEmits<{ cancel: [] }>()

  const {
    cover,
    sectionId,
    topics,
    topicsFull,
    visible,
    allowComment,
    publishing,
    canPublish,
    openCoverLibrary,
    removeCover,
    addTopic,
    removeTopic,
    createTopic,
    publish,
  } = props.host

  const { data: sections, pending: sectionsPending } = useHikariApiData('/api/v3/sections', {
    query: { page: 1, page_size: 50 },
    lazy: true,
  })
  const sectionOptions = computed(() => sections.value?.items ?? [])

  const op = ref<InstanceType<typeof Popover>>()
  const {
    query,
    kw,
    busy,
    sections: topicSections,
    canCreate,
    selectedIds,
    ensureLoaded,
  } = useTopics({ selected: () => topics.value, full: () => topicsFull.value })

  function toggleTopics(event: MouseEvent) {
    op.value?.toggle(event)
  }
  function pickTopic(t: TopicOption) {
    if (selectedIds.value.has(t.id)) removeTopic(t.id)
    else addTopic({ id: t.id, name: t.name })
  }
  function onCreateTopic() {
    if (!canCreate.value) return
    createTopic(kw.value)
    query.value = ''
  }

  const VISIBILITY = [
    { label: '公开', value: 'PUBLIC' },
    { label: '私密', value: 'PRIVATE' },
  ]

  async function onConfirm() {
    await publish()
  }
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-color">封面</label>
      <div v-if="cover" class="flex items-center gap-3">
        <HikariImage
          :src="cover.src"
          alt=""
          class="aspect-8/5 h-12 shrink-0 overflow-hidden rounded-md border border-surface-200 dark:border-surface-800"
          image-class="size-full object-cover"
          :processing="{ q: 70 }"
        />
        <Button size="small" variant="outlined" @click="openCoverLibrary">更换</Button>
        <Button size="small" variant="outlined" severity="secondary" @click="removeCover">
          移除
        </Button>
      </div>
      <Button
        v-else
        unstyled
        class="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-surface-300 px-3 py-1.5 text-sm text-muted-color transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-600"
        @click="openCoverLibrary"
      >
        <ImagePlus :size="16" />
        <span>添加封面</span>
      </Button>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-color">板块</label>
      <Select
        v-model="sectionId"
        :options="sectionOptions"
        option-label="name"
        option-value="id"
        :loading="sectionsPending"
        placeholder="选择板块"
        show-clear
        fluid
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-color">话题</label>
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-for="t in topics"
          :key="t.id"
          class="inline-flex items-center gap-1 rounded-lg bg-surface-100 py-1 pr-1.5 pl-2.5 text-xs font-medium text-color dark:bg-surface-800"
        >
          <span class="text-primary-600">#</span>
          {{ t.name }}
          <Button
            unstyled
            aria-label="移除话题"
            class="grid size-4 cursor-pointer place-items-center rounded text-muted-color transition-colors hover:bg-surface-200 hover:text-color dark:hover:bg-surface-700"
            @click="removeTopic(t.id)"
          >
            <template #icon>
              <X :size="11" />
            </template>
          </Button>
        </span>
        <Button
          v-if="!topicsFull"
          label="话题"
          unstyled
          class="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-surface-300 px-2.5 py-0.5 text-xs font-medium text-muted-color transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-surface-600"
          @click="toggleTopics"
        >
          <template #icon>
            <Hash :size="12" />
          </template>
        </Button>
      </div>
      <Popover ref="op" :pt="{ root: { class: 'popover-no-arrow' } }" @show="ensureLoaded">
        <TopicPicker
          v-model:query="query"
          :loading="busy"
          :sections="topicSections"
          :can-create="canCreate"
          :kw="kw"
          :selected-ids="selectedIds"
          @pick="pickTopic"
          @create="onCreateTopic"
        />
      </Popover>
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-sm font-medium text-color">可见性</label>
      <SelectButton
        v-model="visible"
        :options="VISIBILITY"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
      />
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm font-medium text-color">允许评论</label>
      <ToggleSwitch v-model="allowComment" />
    </div>

    <div class="mt-1 flex items-center justify-end gap-2">
      <Button
        label="取消"
        severity="secondary"
        text
        :disabled="publishing"
        @click="emit('cancel')"
      />
      <Button label="确认发布" :loading="publishing" :disabled="!canPublish" @click="onConfirm" />
    </div>
  </div>
</template>
