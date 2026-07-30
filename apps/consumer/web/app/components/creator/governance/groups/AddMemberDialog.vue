<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import {
    addPermissionGroupMemberResolver,
    type AddPermissionGroupMemberValues,
  } from '~/features/creator/schemas/governance.schema'

  const props = defineProps<{ groupId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ added: [] }>()

  const formErrors = useFormErrors(addPermissionGroupMemberResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  watch(visible, next => {
    if (next) {
      formErrors.clear()
      form.value?.reset()
    }
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as AddPermissionGroupMemberValues
      await hikariRequest('/api/v3/permission-groups/{id}/members', {
        method: 'POST',
        path: { id: props.groupId },
        body: { user_id: values.user_id },
      })
      visible.value = false
      emit('added')
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="添加成员"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '24rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="user_id" label="用户 ID">
        <InputNumber :input-id="id" :use-grouping="false" fluid />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="添加" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
