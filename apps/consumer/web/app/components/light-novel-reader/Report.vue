<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Text, Textarea, toast } from '@hina-ui/vue'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import { buildReport } from '~/features/light-novel-reader/report'
  import { renderReportSchema } from '~/features/light-novel-reader/schemas/report.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'LightNovelReaderReport' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { shell, engine, location, settings, errors, host } = useReader()
  const { report } = shell
  const config = useRuntimeConfig()
  const form = useTemplateRef('form')
  const values = reactive({ note: '' })
  const submitting = ref(false)

  watch(report, open => {
    if (!open) return
    form.value?.reset()
    values.note = ''
  })

  async function submit() {
    const controller = engine.stack.value?.controller
    const position = location.position.value
    const note = values.note.trim()
    submitting.value = true
    try {
      await hikariRequest('/api/v3/reader/volumes/{volume_id}/render-reports', {
        method: 'POST',
        path: { volume_id: props.data.volume.id },
        body: {
          note: note || undefined,
          metadata: buildReport({
            version: config.public.appVersion,
            rito: config.public.ritoVersion,
            position,
            chapter: {
              title: location.title.value || location.current.value?.label || null,
              href: position?.sourceLocator?.href ?? null,
            },
            spread: controller
              ? { current: controller.currentSpread, total: controller.totalSpreads }
              : null,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
              ratio: window.devicePixelRatio,
            },
            stage: { width: host.value?.clientWidth ?? 0, height: host.value?.clientHeight ?? 0 },
            userAgent: navigator.userAgent,
            settings: {
              ...settings.device.value,
              theme: settings.theme.value,
              font: settings.font.value,
            },
            errors: errors.recent.value,
          }),
        },
      })
      report.value = false
      toast.success('报告已提交')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="report" title="报告渲染问题" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="renderReportSchema"
        :disabled="submitting"
        @submit="submit"
      >
        <FormField
          name="note"
          label="问题描述"
          description="报告会附带当前页的位置、窗口尺寸、阅读设置与最近的错误信息。"
          description-placement="control"
        >
          <Textarea v-model="values.note" :rows="4" :maxlength="1000" autosize />
        </FormField>
      </Form>
      <Text v-if="engine.phase.value !== 'ready'" size="sm" tone="muted">
        书还没有打开，报告中不含页面位置。
      </Text>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="report = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">提交</Button>
    </template>
  </Dialog>
</template>
