<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, ScrollArea, Textarea } from '@hina-ui/vue'
  import { usePermissionCatalog } from '~/features/creator/composables/usePermissionCatalog'
  import { permissionGroupSchema } from '~/features/creator/schemas/governance.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ created: [id: number] }>()

  const { entries } = usePermissionCatalog()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ name: string; description: string; permissions: string[] }>({
    name: '',
    description: '',
    permissions: [],
  })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.name = ''
    values.description = ''
    values.permissions = []
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const created = await hikariRequest<'/api/v3/permission-groups', 'post'>(
        '/api/v3/permission-groups',
        {
          method: 'POST',
          body: {
            name: values.name.trim(),
            description: values.description.trim() || undefined,
            permissions: values.permissions,
          },
        },
      )
      visible.value = false
      emit('created', created.id)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="新建权限组" size="xl" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="permissionGroupSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="name" label="名称" required>
          <Input v-model="values.name" autocomplete="off" placeholder="如：Galgame 审核组" />
        </FormField>

        <FormField name="description" label="描述">
          <Textarea v-model="values.description" autosize placeholder="说明此权限组的职责" />
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
      <Button :loading="submitting" @click="form?.submit()">创建</Button>
    </template>
  </Dialog>
</template>
