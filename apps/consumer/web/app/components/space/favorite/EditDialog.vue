<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import {
    type CollectionValues,
    collectionResolver,
  } from '~/features/favorite/schemas/collection.schema'

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
  const formErrors = useFormErrors(collectionResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  const initialValues = computed(() =>
    props.collection
      ? {
          name: props.collection.name,
          description: props.collection.description ?? '',
          is_private: props.collection.is_private,
        }
      : undefined,
  )

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
      const values = event.values as CollectionValues
      const body = {
        name: values.name,
        description: values.description?.length ? values.description : undefined,
        is_private: values.is_private ?? false,
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
    :header="isEdit ? '编辑收藏夹' : '新建收藏夹'"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '26rem' }"
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
        <InputText :id="id" autocomplete="off" fluid placeholder="例如:今年最爱" />
      </FormItem>
      <FormItem v-slot="{ id }" name="description" label="简介">
        <Textarea :id="id" auto-resize rows="2" fluid placeholder="这个收藏夹收什么(可选)" />
      </FormItem>
      <FormItem v-slot="{ id }" name="is_private" label="设为私密">
        <ToggleSwitch :input-id="id" />
      </FormItem>
      <div class="flex justify-end gap-2 pt-1">
        <Button label="取消" text size="small" :disabled="submitting" @click="visible = false" />
        <Button
          type="submit"
          :label="isEdit ? '保存' : '创建'"
          size="small"
          :loading="submitting"
        />
      </div>
    </Form>
  </Dialog>
</template>
