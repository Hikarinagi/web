<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, Switch, Textarea } from '@hina-ui/vue'
  import { useFavoriteCollections } from '~/features/favorite/composables/useFavoriteCollections'
  import type { FavoriteEntityType } from '~/features/favorite/entity'
  import { collectionSchema } from '~/features/favorite/schemas/collection.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'FavoriteCollectionCreateDialog' })

  const props = defineProps<{ type: FavoriteEntityType; id: number }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ created: [] }>()

  const { create } = useFavoriteCollections(props.type, props.id)

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ name: '', description: '', is_private: false })

  watch(visible, next => {
    if (!next) return
    values.name = ''
    values.description = ''
    values.is_private = false
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await create({ ...values, name: values.name.trim() })
      visible.value = false
      emit('created')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="新建收藏夹" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="collectionSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="name" label="收藏夹名称" required>
          <Input v-model="values.name" autocomplete="off" placeholder="例如：今年最爱" />
        </FormField>

        <FormField name="description" label="简介">
          <Textarea
            v-model="values.description"
            :rows="3"
            placeholder="这个收藏夹用来收录什么"
            class="w-full"
          />
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
      <Button :loading="submitting" @click="form?.submit()">创建并收藏</Button>
    </template>
  </Dialog>
</template>
