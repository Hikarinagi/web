<script setup lang="ts">
  import { Button, Dialog, Form, FormField, NumberInput } from '@hina-ui/vue'
  import { purchaseQuotaSchema } from '~/features/workbench/schemas/workbench.schema'
  import type { BackendAiQuota } from '~/features/workbench/workbench'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ charsPerPoint: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ purchased: [quota: BackendAiQuota] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ points: number | null }>({ points: 10 })

  const chars = computed(() => (values.points ?? 0) * props.charsPerPoint)

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.points = 10
  })

  async function onSubmit() {
    if (values.points === null || submitting.value) return
    submitting.value = true
    try {
      const quota = await hikariRequest('/api/v3/user/me/ai-quota/purchase', {
        method: 'POST',
        body: { points: values.points },
      })
      visible.value = false
      emit('purchased', quota)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="兑换 AI 翻译额度" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="purchaseQuotaSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="points"
          label="使用光点"
          :description="`将添加 ${chars} 个字符的额度。`"
          description-placement="control"
          required
        >
          <NumberInput v-model="values.points" :min="1" :max="100000" :step="10" />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">兑换</Button>
    </template>
  </Dialog>
</template>
