<script setup lang="ts">
  import {
    Button,
    Dialog,
    FormField,
    Inline,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Statistic,
    Tag,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { PRETRANSLATION_STATUS_META } from '~/features/workbench/labels'
  import type { BackendNovelChapter } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    chapters: BackendNovelChapter[]
    chapter: BackendNovelChapter | null
    quota: WorkbenchProjectPageData['quota']
    batches: WorkbenchProjectPageData['pretranslations']
  }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ changed: [] }>()

  const SCOPE_OPTIONS = [
    { value: 'volume', label: '全卷' },
    { value: 'chapter', label: '本章' },
  ]

  const scope = ref<'volume' | 'chapter'>('volume')
  const requesting = ref(false)
  const purchaseOpen = ref(false)
  const quota = ref(props.quota)
  const list = ref(props.batches)

  watch(
    () => [props.quota, props.batches] as const,
    ([nextQuota, nextBatches]) => {
      quota.value = nextQuota
      list.value = nextBatches
    },
  )
  watch(open, async next => {
    if (!next || !props.chapter) return
    list.value = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/pretranslations', {
      path: { chapter_id: props.chapter.id },
      toast: false,
    }).catch(() => list.value)
  })

  const pendingOf = (chapter: BackendNovelChapter) =>
    Math.max(0, chapter.segment_count - chapter.done_count)
  const targets = computed(() =>
    scope.value === 'chapter'
      ? props.chapter && pendingOf(props.chapter)
        ? [props.chapter]
        : []
      : props.chapters.filter(chapter => pendingOf(chapter) > 0),
  )
  const untranslated = computed(() =>
    targets.value.reduce((sum, chapter) => sum + pendingOf(chapter), 0),
  )
  const running = computed(() =>
    list.value.some(batch => batch.status === 'PENDING' || batch.status === 'RUNNING'),
  )

  async function refresh() {
    if (!props.chapter) return
    list.value = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/pretranslations', {
      path: { chapter_id: props.chapter.id },
      toast: false,
    }).catch(() => list.value)
  }

  const { pause, resume } = useIntervalFn(() => void refresh(), 5000, { immediate: false })
  watch([running, open], ([active, visible]) => (active && visible ? resume() : pause()), {
    immediate: true,
  })

  async function start() {
    if (requesting.value) return
    requesting.value = true
    let queued = 0
    try {
      for (const chapter of targets.value) {
        await hikariRequest('/api/v3/novel-chapters/{chapter_id}/pretranslations', {
          method: 'POST',
          path: { chapter_id: chapter.id },
          body: {},
        })
        queued++
      }
    } finally {
      requesting.value = false
      if (queued) {
        toast.success(`已将 ${queued} 章添加到翻译队列中。`)
        await refresh()
        emit('changed')
      }
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="AI 翻译" size="md" :locked="requesting">
    <template #content>
      <Stack gap="lg">
        <FormField label="范围">
          <SegmentedControl v-model="scope" :options="SCOPE_OPTIONS" />
        </FormField>
        <SimpleGrid min="10rem" gap="md">
          <Statistic label="未翻译的段落" :value="untranslated" suffix="段" />
          <Statistic v-if="quota" label="当前可用" :value="quota.remaining" suffix="字" />
        </SimpleGrid>
        <Text size="sm" tone="muted">
          AI 译文保存为你自己的译文并标记为机翻。一旦你编辑了一个段落，它就不再算作未经编辑的机翻。
        </Text>
        <Stack v-if="list.length" gap="xs">
          <Text size="sm" weight="medium">最近对本章的请求</Text>
          <Stack gap="none" class="divide-y divide-line">
            <Inline
              v-for="batch in list.slice(0, 5)"
              :key="batch.id"
              gap="sm"
              align="center"
              justify="between"
              :wrap="false"
              class="py-2"
            >
              <Stack gap="none" class="min-w-0">
                <Text size="sm">{{ batch.segment_count }} 段</Text>
                <Text size="xs" tone="muted" truncate>
                  {{ timeFormat(batch.created_at) }}
                  <template v-if="batch.error"> · {{ batch.error }}</template>
                </Text>
              </Stack>
              <Tag size="sm" :tone="PRETRANSLATION_STATUS_META[batch.status]?.tone ?? 'neutral'">
                {{ PRETRANSLATION_STATUS_META[batch.status]?.label ?? batch.status }}
              </Tag>
            </Inline>
          </Stack>
        </Stack>
      </Stack>
    </template>
    <template #footer>
      <Button
        v-if="quota"
        variant="ghost"
        tone="neutral"
        class="me-auto"
        @click="purchaseOpen = true"
      >
        用光点兑换
      </Button>
      <Button variant="ghost" tone="neutral" :disabled="requesting" @click="open = false">
        取消
      </Button>
      <Button :loading="requesting" :disabled="!untranslated" @click="start">开始翻译</Button>
    </template>
  </Dialog>
  <WorkbenchQuotaPurchaseDialog
    v-if="quota"
    v-model:visible="purchaseOpen"
    :chars-per-point="quota.chars_per_point"
    @purchased="next => (quota = next)"
  />
</template>
