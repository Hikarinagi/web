<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { push } from 'notivue'
  import { EPUB_REPORT_REASON_OPTIONS } from '~/features/light-novel-volume/epub-report'
  import {
    epubReportResolver,
    type EpubReportFormValues,
  } from '~/features/light-novel-volume/schemas/epub-report.schema'
  import { useEpubFeedback } from '~/features/light-novel-volume/useEpubFeedback'

  defineOptions({ name: 'LightNovelVolumeEpubFeedbackDialog' })
  const props = defineProps<{ volumeId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { file, pickFile, submitting, review, status, isTerminal, submit, reset, pause } =
    useEpubFeedback(props.volumeId)

  const formErrors = useFormErrors(epubReportResolver)
  const form = useTemplateRef<FormInstance>('form')
  const selectedReason = ref<string | null>(null)
  const requiresDescription = computed(() => selectedReason.value === 'OTHER')

  function restart() {
    formErrors.clear()
    form.value?.reset()
    selectedReason.value = null
    reset()
  }

  watch(visible, next => {
    if (next) restart()
    else pause()
  })

  function syncReason(value: unknown) {
    selectedReason.value = (value ?? null) as string | null
  }

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    try {
      const mode = await submit(event.values as EpubReportFormValues)
      if (mode === 'reported') {
        push.success({ message: '已收到,我们会尽快核实' })
        visible.value = false
      }
    } catch (error) {
      await formErrors.apply(error, form.value)
    }
  }

  function close() {
    if (submitting.value) return
    visible.value = false
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="报告 EPUB 问题"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '32rem' }"
  >
    <Form
      v-if="!review"
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id, errorId }" name="reason" label="问题类型" required>
        <Select
          :input-id="id"
          :aria-describedby="errorId"
          :options="EPUB_REPORT_REASON_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="请选择问题类型"
          fluid
          @update:model-value="syncReason"
        />
      </FormItem>

      <FormItem
        v-slot="{ id, errorId }"
        name="description"
        label="补充说明"
        :required="requiresDescription"
      >
        <Textarea
          :id="id"
          :aria-describedby="errorId"
          rows="3"
          maxlength="500"
          auto-resize
          fluid
          :placeholder="requiresDescription ? '请描述具体问题' : '可补充说明具体问题(选填)'"
        />
      </FormItem>

      <LightNovelVolumeEpubUploadZone
        :file="file"
        label="有更正确的 EPUB?"
        hint="一并上传,自动校验通过后会替换当前文件"
        @pick="pickFile"
      />

      <div class="flex justify-end gap-3 pt-1">
        <Button label="取消" severity="secondary" text :disabled="submitting" @click="close" />
        <Button :label="file ? '提交并上传' : '提交报告'" type="submit" :loading="submitting" />
      </div>
    </Form>

    <div v-else class="flex flex-col gap-4">
      <LightNovelVolumeEpubReviewResult
        :review="review"
        :is-terminal="isTerminal"
        :status="status"
        mode="fix"
      />
      <div v-if="isTerminal" class="flex justify-end gap-3 pt-1">
        <Button
          v-if="status === 'REJECTED' || status === 'FAILED'"
          label="重新提交"
          severity="secondary"
          outlined
          @click="restart"
        />
        <Button label="完成" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>
