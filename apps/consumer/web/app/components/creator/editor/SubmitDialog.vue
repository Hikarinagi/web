<script setup lang="ts">
  import { Alert, Button, Dialog, Form, FormField, Heading, Stack, Textarea } from '@hina-ui/vue'
  import type { Changeset } from '~/features/creator/editor/changeset'
  import { editorSubmitSchema } from '~/features/creator/schemas/editor-submit.schema'

  const props = defineProps<{
    changeset: Changeset
    resourceType: string
    needsReview: boolean
    submitting: boolean
    isContinue?: boolean
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ confirm: [summary: string] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ summary: '' })
  const payload = ref<Record<string, unknown>[]>([])

  watchEffect(() => {
    if (visible.value) payload.value = props.changeset as unknown as Record<string, unknown>[]
  })

  watch(visible, next => {
    if (next) return
    form.value?.reset()
    values.summary = ''
  })

  const notice = computed(() => {
    if (props.isContinue) {
      return { tone: 'warning' as const, text: '确认后将更新这个进行中的变更请求' }
    }
    if (props.needsReview) {
      return { tone: 'warning' as const, text: '提交后将进入审核队列，由审核者合并后生效' }
    }
    return { tone: 'success' as const, text: '确认后修改将立即生效' }
  })

  function onSubmit() {
    emit('confirm', values.summary.trim())
  }
</script>

<template>
  <Dialog v-model:open="visible" title="确认提交变更" size="xl" :locked="submitting">
    <template #content>
      <Stack gap="md">
        <Stack gap="sm">
          <Heading :level="3" size="sm">变更内容（{{ payload.length }}）</Heading>
          <CreatorChangesetView :payload="payload" :resource-type="resourceType" />
        </Stack>

        <Alert :tone="notice.tone">{{ notice.text }}</Alert>

        <Form
          ref="form"
          :values="values"
          :rules="editorSubmitSchema"
          :disabled="submitting"
          @submit="onSubmit"
        >
          <FormField name="summary" label="变更说明" required>
            <Textarea v-model="values.summary" autosize placeholder="说明本次修改的内容与原因" />
          </FormField>
        </Form>
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">确认提交</Button>
    </template>
  </Dialog>
</template>
