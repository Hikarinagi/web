<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { BackendPermissionGroup } from '~/features/creator/governance'
  import { usePermissionCatalog } from '~/features/creator/composables/usePermissionCatalog'
  import {
    permissionGroupResolver,
    type PermissionGroupValues,
  } from '~/features/creator/schemas/governance.schema'

  const props = defineProps<{ group: BackendPermissionGroup }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ updated: [] }>()

  const { entries } = usePermissionCatalog()
  const formErrors = useFormErrors(permissionGroupResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  const initialValues = computed(() => ({
    name: props.group.name,
    description: props.group.description ?? '',
    permissions: [...props.group.permissions],
  }))

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
      await hikariRequest('/api/v3/permission-groups/{id}', {
        method: 'PATCH',
        path: { id: props.group.id },
        body: {
          name: values.name,
          description: values.description?.length ? values.description : undefined,
          permissions: values.permissions,
        },
      })
      visible.value = false
      emit('updated')
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
    header="编辑权限组"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '40rem' }"
  >
    <Form
      ref="form"
      :initial-values="initialValues"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="name" label="名称" required>
        <InputText :id="id" autocomplete="off" fluid />
      </FormItem>

      <FormItem v-slot="{ id }" name="description" label="描述">
        <Textarea :id="id" rows="2" fluid />
      </FormItem>

      <FormItem v-slot="{ field }" name="permissions" label="权限" required>
        <ScrollArea class="max-h-[40vh] rounded-md ring-1 ring-surface-200 dark:ring-surface-700">
          <CreatorGovernancePermissionTree
            :model-value="field.value as string[]"
            :entries="entries"
            @update:model-value="value => field.props.onInput({ value })"
          />
        </ScrollArea>
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="保存" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
