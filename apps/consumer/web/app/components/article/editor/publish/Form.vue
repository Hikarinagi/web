<script setup lang="ts">
  import {
    Button,
    Chip,
    FormField,
    Inline,
    Popover,
    SegmentedControl,
    Select,
    Stack,
    Switch,
  } from '@hina-ui/vue'
  import { Hash, ImagePlus } from '@lucide/vue'
  import { useTopics, type TopicOption } from '~/components/topic/useTopics'
  import type { ArticleEditorHost } from '../composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishForm' })

  const props = defineProps<{ host: ArticleEditorHost }>()

  const {
    cover,
    sectionId,
    topics,
    topicsFull,
    visible,
    allowComment,
    openCoverLibrary,
    removeCover,
    addTopic,
    removeTopic,
    createTopic,
  } = props.host

  const { data: sections, pending: sectionsPending } = useHikariApiData('/api/v3/sections', {
    query: { page: 1, page_size: 50 },
    lazy: true,
  })
  const sectionOptions = computed(() =>
    (sections.value?.items ?? []).map(section => ({ value: section.id, label: section.name })),
  )
  const sectionValue = computed({
    get: () => sectionId.value,
    set: (value: string | number | null | undefined) => {
      sectionId.value = typeof value === 'number' ? value : null
    },
  })

  const topicsOpen = ref(false)
  const {
    query,
    kw,
    busy,
    sections: topicSections,
    canCreate,
    selectedIds,
    ensureLoaded,
  } = useTopics({ selected: () => topics.value, full: () => topicsFull.value })

  watch(topicsOpen, open => {
    if (open) void ensureLoaded()
  })

  function pickTopic(topic: TopicOption) {
    if (selectedIds.value.has(topic.id)) removeTopic(topic.id)
    else addTopic({ id: topic.id, name: topic.name })
  }

  function onCreateTopic() {
    if (!canCreate.value) return
    createTopic(kw.value)
    query.value = ''
  }

  const VISIBILITY = [
    { value: 'PUBLIC', label: '公开' },
    { value: 'PRIVATE', label: '私密' },
  ]
</script>

<template>
  <Stack gap="lg">
    <FormField label="封面">
      <Inline v-if="cover" gap="sm" align="center">
        <HikariImage
          :src="cover.src"
          alt=""
          class="aspect-8/5 h-12 shrink-0 overflow-hidden rounded-md border border-line"
          image-class="size-full object-cover"
          :processing="{ q: 70 }"
        />
        <Button variant="outline" size="sm" @click="openCoverLibrary">更换</Button>
        <Button variant="outline" tone="neutral" size="sm" @click="removeCover">移除</Button>
      </Inline>
      <Button
        v-else
        variant="outline"
        tone="neutral"
        size="sm"
        class="w-fit border-dashed"
        @click="openCoverLibrary"
      >
        <template #icon><ImagePlus /></template>
        添加封面
      </Button>
    </FormField>

    <FormField label="板块">
      <Select
        v-model="sectionValue"
        :options="sectionOptions"
        :disabled="sectionsPending"
        clearable
        placeholder="选择板块"
      />
    </FormField>

    <FormField label="话题">
      <Inline gap="sm" align="center" wrap>
        <Chip v-for="topic in topics" :key="topic.id" removable @remove="removeTopic(topic.id)">
          <template #icon><Hash /></template>
          {{ topic.name }}
        </Chip>

        <Popover v-if="!topicsFull" v-model:open="topicsOpen" :padded="false" align="start">
          <Button variant="outline" tone="neutral" size="sm" class="border-dashed">
            <template #icon><Hash /></template>
            话题
          </Button>
          <template #content>
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
          </template>
        </Popover>
      </Inline>
    </FormField>

    <FormField label="可见性">
      <SegmentedControl v-model="visible" :options="VISIBILITY" size="sm" />
    </FormField>

    <Switch v-model="allowComment" control-placement="end" block>允许评论</Switch>
  </Stack>
</template>
