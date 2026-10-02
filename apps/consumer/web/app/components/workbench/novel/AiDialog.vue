<script setup lang="ts">
  import {
    Button,
    Card,
    Dialog,
    FormField,
    Inline,
    SegmentedControl,
    Stack,
    Statistic,
    Tag,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import { useAiCredits } from '~/features/items/ai-credits'
  import { useAiModels } from '~/features/workbench/composables/useAi'
  import { PRETRANSLATION_STATUS_META } from '~/features/workbench/labels'
  import type { BackendNovelChapter } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    chapters: BackendNovelChapter[]
    chapter: BackendNovelChapter | null
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
  const list = ref(props.batches)
  const { credits, load: loadCredits, purchase } = useAiCredits()
  const { models, model, load: loadModels } = useAiModels('novel_translate')

  watch(
    () => props.batches,
    next => (list.value = next),
  )
  watch(open, next => {
    if (!next) return
    void refresh()
    void loadCredits()
    void loadModels()
  })

  const pendingOf = (chapter: BackendNovelChapter) =>
    Math.max(0, chapter.segment_count - chapter.done_count - chapter.queued_count)
  const inScope = computed(() =>
    scope.value === 'chapter' ? (props.chapter ? [props.chapter] : []) : props.chapters,
  )
  const targets = computed(() => inScope.value.filter(chapter => pendingOf(chapter) > 0))
  const submittable = computed(() =>
    targets.value.reduce((sum, chapter) => sum + pendingOf(chapter), 0),
  )

  const rangeOf = (batch: WorkbenchProjectPageData['pretranslations'][number]) => {
    const { first_number: first, last_number: last, segment_count: count } = batch
    if (first === null || last === null) return `${count} 段`
    const range = first === last ? `第 ${first} 段` : `第 ${first}–${last} 段`
    return last - first + 1 === count ? range : `${range}，共 ${count} 段`
  }
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
          body: model.value ? { model: model.value } : {},
        })
        queued++
      }
    } finally {
      requesting.value = false
      if (queued) {
        toast.success(`已将 ${queued} 章添加到翻译队列中。`)
        await Promise.all([refresh(), loadCredits()])
        emit('changed')
      }
    }
  }

  const cancelling = ref(false)
  const cancellable = computed(() =>
    list.value.some(batch => batch.mine && batch.status === 'PENDING'),
  )

  async function cancel() {
    if (!props.chapter || cancelling.value) return
    cancelling.value = true
    try {
      list.value = await hikariRequest('/api/v3/novel-chapters/{chapter_id}/pretranslations', {
        method: 'delete',
        path: { chapter_id: props.chapter.id },
      })
      toast.success('已取消排队中的请求')
      await loadCredits()
      emit('changed')
    } finally {
      cancelling.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" title="AI 翻译" size="md" :locked="requesting || cancelling">
    <template #content>
      <Stack gap="lg">
        <FormField label="范围">
          <SegmentedControl v-model="scope" :options="SCOPE_OPTIONS" />
        </FormField>
        <WorkbenchAiModelField
          v-if="models.length"
          v-model="model"
          label="模型"
          :models="models"
          unit="kchar"
        />
        <Statistic label="未翻译的段落" :value="submittable" suffix="段" />
        <Card v-if="credits && models.length" class="bg-subtle">
          <WorkbenchAiWallet :credits="credits" @purchase="purchase()" />
        </Card>
        <Text v-if="models.length" size="sm" tone="muted">
          提交时先按原文字数预扣积分，完成后按实际用量结算，多扣的会退回。
        </Text>
        <Text size="sm" tone="muted">
          AI 译文保存为你自己的译文并标记为机翻。一旦你编辑了一个段落，它就不再算作未经编辑的机翻。
        </Text>
        <Stack v-if="list.length" gap="xs">
          <Inline align="center" justify="between" gap="sm">
            <Text size="sm" weight="medium">最近对本章的请求</Text>
            <Button
              v-if="cancellable"
              size="sm"
              variant="ghost"
              tone="neutral"
              :loading="cancelling"
              @click="cancel"
            >
              取消排队
            </Button>
          </Inline>
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
                <Text size="sm">{{ rangeOf(batch) }}</Text>
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
      <Button variant="ghost" tone="neutral" :disabled="requesting" @click="open = false">
        取消
      </Button>
      <Button :loading="requesting" :disabled="!submittable" @click="start">开始翻译</Button>
    </template>
  </Dialog>
</template>
