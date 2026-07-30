<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { usePermissionCatalog } from '~/features/creator/composables/usePermissionCatalog'
  import {
    permissionGroupResolver,
    type PermissionGroupValues,
  } from '~/features/creator/schemas/governance.schema'

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ created: [id: number] }>()

  const { entries } = usePermissionCatalog()
  const formErrors = useFormErrors(permissionGroupResolver)
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
      const values = event.values as PermissionGroupValues
      const created = await hikariRequest<'/api/v3/permission-groups', 'post'>(
        '/api/v3/permission-groups',
        {
          method: 'POST',
          body: {
            name: values.name,
            description: values.description?.length ? values.description : undefined,
            permissions: values.permissions,
          },
        },
      )
      visible.value = false
      emit('created', created.id)
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
    header="新建权限组"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '40rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="name" label="名称" required>
        <InputText :id="id" autocomplete="off" fluid placeholder="如:Galgame 审核组" />
      </FormItem>

      <FormItem v-slot="{ id }" name="description" label="描述">
        <Textarea :id="id" rows="2" fluid placeholder="说明此权限组的职责" />
      </FormItem>

      <FormItem v-slot="{ field }" name="permissions" label="权限" required :initial-value="[]">
        <div
          class="max-h-[40vh] overflow-auto rounded-md ring-1 ring-surface-200 dark:ring-surface-700"
        >
          <CreatorGovernancePermissionTree
            :model-value="field.value as string[]"
            :entries="entries"
            @update:model-value="value => field.props.onInput({ value })"
          />
        </div>
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="创建" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
