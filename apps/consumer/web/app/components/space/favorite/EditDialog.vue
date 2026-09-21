<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, Switch, Textarea } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { collectionSchema } from '~/features/favorite/schemas/collection.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'SpaceFavoriteEditDialog' })

  type SavedCollection = ApiData<'/api/v3/favorite-collections/{collection_id}', 'get'>
  type EditableCollection = {
    id: number
    name: string
    description: string | null
    is_private: boolean
  }

  const props = defineProps<{ collection?: EditableCollection | null }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ saved: [collection: SavedCollection, isNew: boolean] }>()

  const isEdit = computed(() => Boolean(props.collection))
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ name: '', description: '', is_private: false })

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.name = props.collection?.name ?? ''
    values.description = props.collection?.description ?? ''
    values.is_private = props.collection?.is_private ?? false
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const body = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        is_private: values.is_private,
      }
      if (props.collection) {
        const saved = (await hikariRequest<'/api/v3/favorite-collections/{collection_id}', 'patch'>(
          '/api/v3/favorite-collections/{collection_id}',
          { method: 'PATCH', path: { collection_id: props.collection.id }, body },
        )) as SavedCollection
        emit('saved', saved, false)
      } else {
        const saved = (await hikariRequest<'/api/v3/favorite-collections', 'post'>(
          '/api/v3/favorite-collections',
          { method: 'POST', body },
        )) as SavedCollection
        emit('saved', saved, true)
      }
      visible.value = false
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="visible"
    :title="isEdit ? '编辑收藏夹' : '新建收藏夹'"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="collectionSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="name" label="名称" required>
          <Input v-model="values.name" autocomplete="off" placeholder="例如：今年最爱" />
        </FormField>

        <FormField name="description" label="简介">
          <Textarea v-model="values.description" autosize placeholder="这个收藏夹收什么（可选）" />
        </FormField>

        <FormField name="is_private">
          <Switch v-model="values.is_private" control-placement="end" block>设为私密</Switch>
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">{{ isEdit ? '保存' : '创建' }}</Button>
    </template>
  </Dialog>
</template>
