<script setup lang="ts">
  import { Button, Form, FormField, Inline, Input, Stack, Switch, Text } from '@hina-ui/vue'
  import {
    type CollectionValues,
    collectionSchema,
  } from '~/features/favorite/schemas/collection.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'FavoriteCollectionCreateForm' })

  const props = defineProps<{ submit: (values: CollectionValues) => Promise<void> }>()
  const emit = defineEmits<{ cancel: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ name: '', description: '', is_private: false })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await props.submit({ ...values })
      emit('cancel')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Stack gap="sm" class="p-4">
    <Text size="sm" weight="semibold">新建收藏夹</Text>

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

      <FormField name="is_private">
        <Switch v-model="values.is_private" control-placement="end" block>设为私密</Switch>
      </FormField>
    </Form>

    <Inline gap="sm" justify="end">
      <Button
        variant="ghost"
        tone="neutral"
        size="sm"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        取消
      </Button>
      <Button size="sm" :loading="submitting" @click="form?.submit()">创建并收藏</Button>
    </Inline>
  </Stack>
</template>
