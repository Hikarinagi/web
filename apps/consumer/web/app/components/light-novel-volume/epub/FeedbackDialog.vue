<script setup lang="ts">
  import { Button, Dialog, FileUpload, Form, FormField, Select, Textarea } from '@hina-ui/vue'
  import { push } from 'notivue'
  import {
    EPUB_REPORT_REASON_OPTIONS,
    EPUB_REPORT_REASON_VALUES,
  } from '~/features/light-novel-volume/epub-report'
  import { epubReportSchema } from '~/features/light-novel-volume/schemas/epub-report.schema'
  import { useEpubFeedback } from '~/features/light-novel-volume/useEpubFeedback'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'LightNovelVolumeEpubFeedbackDialog' })
  const props = defineProps<{ volumeId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { file, submitting, review, status, isTerminal, submit, reset, pause } = useEpubFeedback(
    props.volumeId,
  )

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive<{ reason: string | null; description: string }>({
    reason: null,
    description: '',
  })
  const requiresDescription = computed(() => values.reason === 'OTHER')

  function restart() {
    form.value?.reset()
    values.reason = null
    values.description = ''
    reset()
  }

  watch(visible, next => {
    if (next) restart()
    else pause()
  })

  async function onSubmit() {
    const reason = EPUB_REPORT_REASON_VALUES.find(value => value === values.reason)
    if (!reason || submitting.value) return
    try {
      const mode = await submit({ reason, description: values.description })
      if (mode === 'reported') {
        push.success({ message: '已收到，我们会尽快核实' })
        visible.value = false
      }
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    }
  }

  function close() {
    if (submitting.value) return
    visible.value = false
  }
</script>

<template>
  <Dialog v-model:open="visible" title="报告 EPUB 问题" size="lg" :locked="submitting">
    <template #content>
      <Form
        v-if="!review"
        ref="form"
        :values="values"
        :rules="epubReportSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="reason" label="问题类型" required>
          <Select
            v-model="values.reason"
            :options="EPUB_REPORT_REASON_OPTIONS"
            placeholder="请选择问题类型"
          />
        </FormField>

        <FormField name="description" label="补充说明" :required="requiresDescription">
          <Textarea
            v-model="values.description"
            autosize
            maxlength="500"
            :placeholder="requiresDescription ? '请描述具体问题' : '可补充说明具体问题（选填）'"
          />
        </FormField>

        <FileUpload v-model="file" accept=".epub,application/epub+zip">
          有更正确的 EPUB？一并上传，自动校验通过后会替换当前文件
        </FileUpload>
      </Form>

      <LightNovelVolumeEpubReviewResult
        v-else
        :review="review"
        :is-terminal="isTerminal"
        :status="status"
        mode="fix"
      />
    </template>

    <template v-if="!review || isTerminal" #footer>
      <template v-if="!review">
        <Button variant="ghost" tone="neutral" :disabled="submitting" @click="close">取消</Button>
        <Button :loading="submitting" @click="form?.submit()">
          {{ file ? '提交并上传' : '提交报告' }}
        </Button>
      </template>
      <template v-else>
        <Button
          v-if="status === 'REJECTED' || status === 'FAILED'"
          variant="outline"
          tone="neutral"
          @click="restart"
        >
          重新提交
        </Button>
        <Button @click="visible = false">完成</Button>
      </template>
    </template>
  </Dialog>
</template>
