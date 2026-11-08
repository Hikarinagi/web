<script setup lang="ts">
  import { Button, Dialog, Form, FormField, NumberInput } from '@hina-ui/vue'
  import { addPermissionGroupMemberSchema } from '~/features/creator/schemas/governance.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ groupId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ added: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ user_id: number | null }>({ user_id: null })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.user_id = null
  })

  async function onSubmit() {
    const userId = values.user_id
    if (userId === null || submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/permission-groups/{id}/members', {
        method: 'POST',
        path: { id: props.groupId },
        body: { user_id: userId },
      })
      visible.value = false
      emit('added')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="添加成员" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="addPermissionGroupMemberSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="user_id" label="用户 ID" required>
          <NumberInput v-model="values.user_id" :min="1" :step="1" />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">添加</Button>
    </template>
  </Dialog>
</template>
