<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import {
    type CollectionValues,
    collectionResolver,
  } from '~/features/favorite/schemas/collection.schema'

  defineOptions({ name: 'FavoriteCollectionCreateForm' })

  const props = defineProps<{ submit: (values: CollectionValues) => Promise<void> }>()
  const emit = defineEmits<{ cancel: [] }>()

  const formErrors = useFormErrors(collectionResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      await props.submit(event.values as CollectionValues)
      emit('cancel')
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Form
    ref="form"
    :resolver="formErrors.resolver"
    class="flex flex-col gap-3 bg-surface-50 p-4 dark:bg-surface-900/40"
    @input="formErrors.clear"
    @submit="onSubmit"
  >
    <p class="text-[13px] font-semibold text-color">新建收藏夹</p>
    <FormItem v-slot="{ id }" name="name" label="收藏夹名称" required>
      <InputText :id="id" autocomplete="off" fluid placeholder="例如:今年最爱" />
    </FormItem>
    <FormItem v-slot="{ id }" name="is_private" label="设为私密" :initial-value="false">
      <ToggleSwitch :input-id="id" />
    </FormItem>
    <div class="flex justify-end gap-2 pt-1">
      <Button label="取消" text size="small" :disabled="submitting" @click="emit('cancel')" />
      <Button type="submit" label="创建并收藏" size="small" :loading="submitting" />
    </div>
  </Form>
</template>
