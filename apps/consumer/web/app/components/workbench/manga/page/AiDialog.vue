<script setup lang="ts">
  import { Button, Card, Dialog, Stack, Statistic, Text, toast } from '@hina-ui/vue'
  import { useAiCredits } from '~/features/items/ai-credits'
  import { useAiModels } from '~/features/workbench/composables/useAi'
  import { MANGA_TASK_LABEL } from '~/features/workbench/manga/labels'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    project: BackendMangaProject
    pageIds?: number[]
    pageCount: number
    kind: 'DETECT' | 'OCR' | 'TRANSLATE'
    follow: boolean
  }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ queued: [] }>()

  const submitting = ref(false)
  const { credits, load: loadCredits, purchase } = useAiCredits()
  const vision = useAiModels('manga_vision', true)
  const translation = useAiModels('manga_translate')

  const byModel = computed(() => props.kind !== 'TRANSLATE' && props.project.source_lang !== 'ja')
  const translates = computed(() => props.kind === 'TRANSLATE' || props.follow)
  const billed = computed(
    () =>
      (byModel.value && vision.models.value.length > 0) ||
      (translates.value && translation.models.value.length > 0),
  )
  const recognizeCost = computed(() =>
    vision.selected.value ? vision.selected.value.credits_per_page * props.pageCount : 0,
  )
  const title = computed(() =>
    props.follow ? '全部自动处理' : (MANGA_TASK_LABEL[props.kind] ?? props.kind),
  )

  watch(open, next => {
    if (!next) return
    void loadCredits()
    if (byModel.value) void vision.load()
    if (translates.value) void translation.load()
  })

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/manga-projects/{project_id}/tasks', {
        method: 'post',
        path: { project_id: props.project.id },
        body: {
          kind: props.kind,
          page_ids: props.pageIds,
          follow: props.follow,
          model:
            props.kind === 'TRANSLATE'
              ? (translation.model.value ?? undefined)
              : byModel.value
                ? (vision.model.value ?? undefined)
                : undefined,
          follow_model: props.follow ? (translation.model.value ?? undefined) : undefined,
        },
      })
      toast.success(`任务已添加到处理队列：${title.value}`)
      open.value = false
      emit('queued')
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" :title="title" size="sm" :locked="submitting">
    <template #content>
      <Stack gap="lg">
        <Text size="sm" tone="muted">将处理 {{ pageCount }} 页。</Text>
        <WorkbenchAiModelField
          v-if="byModel && vision.models.value.length"
          v-model="vision.model.value"
          label="识别模型"
          :models="vision.models.value"
          unit="page"
        />
        <Statistic
          v-if="byModel && recognizeCost"
          label="识别预计消耗"
          :value="recognizeCost"
          prefix="约 "
          suffix=" 积分"
        />
        <WorkbenchAiModelField
          v-if="translates && translation.models.value.length"
          v-model="translation.model.value"
          label="翻译模型"
          :models="translation.models.value"
          unit="kchar"
        />
        <Card v-if="credits && billed" class="bg-subtle">
          <WorkbenchAiWallet :credits="credits" @purchase="purchase()" />
        </Card>
        <Text v-if="billed" size="sm" tone="muted">
          提交时先按预计用量预扣积分，完成后按实际用量结算，多扣的会退回。
        </Text>
        <Text v-if="follow && translation.models.value.length" size="sm" tone="muted">
          标出文本框后才能算出翻译要用的积分；那时积分不够，就跳过这一页的翻译，其余步骤照常进行。
        </Text>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="submit">开始</Button>
    </template>
  </Dialog>
</template>
