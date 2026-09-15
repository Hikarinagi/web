<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, ScrollArea, Textarea } from '@hina-ui/vue'
  import type { BackendPermissionGroup } from '~/features/creator/governance'
  import { usePermissionCatalog } from '~/features/creator/composables/usePermissionCatalog'
  import { permissionGroupSchema } from '~/features/creator/schemas/governance.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ group: BackendPermissionGroup }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ updated: [] }>()

  const { entries } = usePermissionCatalog()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ name: string; description: string; permissions: string[] }>({
    name: '',
    description: '',
    permissions: [],
  })

  function fill() {
    values.name = props.group.name
    values.description = props.group.description ?? ''
    values.permissions = [...props.group.permissions]
  }

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    fill()
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/permission-groups/{id}', {
        method: 'PATCH',
        path: { id: props.group.id },
        body: {
          name: values.name.trim(),
          description: values.description.trim() || undefined,
          permissions: values.permissions,
        },
      })
      visible.value = false
      emit('updated')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="编辑权限组" size="xl" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="permissionGroupSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="name" label="名称" required>
          <Input v-model="values.name" autocomplete="off" />
        </FormField>

        <FormField name="description" label="描述">
          <Textarea v-model="values.description" autosize />
        </FormField>

        <FormField name="permissions" label="权限" required>
          <ScrollArea class="max-h-96 rounded-md border border-line">
            <CreatorGovernancePermissionTree v-model="values.permissions" :entries="entries" />
          </ScrollArea>
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">保存</Button>
    </template>
  </Dialog>
</template>
