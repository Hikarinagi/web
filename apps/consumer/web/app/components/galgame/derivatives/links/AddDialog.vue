<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { EXTERNAL_LINK_TYPE_OPTIONS } from '~/features/galgame/labels'
  import {
    galgameExternalLinkResolver,
    type GalgameExternalLinkValues,
  } from '~/features/galgame/schemas/derivatives.schema'
  import { useExternalLinkMutations } from '~/features/galgame/useExternalLinkMutations'

  defineOptions({ name: 'GalgameDerivativesLinksAddDialog' })
  const props = defineProps<{ galgameId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { submitting, create } = useExternalLinkMutations(props.galgameId)
  const formErrors = useFormErrors(galgameExternalLinkResolver)
  const form = useTemplateRef<FormInstance>('form')

  watch(visible, next => {
    if (!next) return
    formErrors.clear()
    form.value?.reset()
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    const values = event.values as GalgameExternalLinkValues
    try {
      await create({ type: values.type, name: values.name, url: values.url })
      visible.value = false
    } catch (error) {
      await formErrors.apply(error, form.value)
    }
  }

  function close() {
    if (submitting.value) return
    visible.value = false
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    header="添加资料链接"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '30rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id, errorId }" name="type" label="类型" required>
        <Select
          :input-id="id"
          :aria-describedby="errorId"
          :options="EXTERNAL_LINK_TYPE_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="请选择类型"
          fluid
        />
      </FormItem>

      <FormItem v-slot="{ id, errorId }" name="name" label="名称" required>
        <InputText :id="id" :aria-describedby="errorId" maxlength="60" fluid />
      </FormItem>

      <FormItem v-slot="{ id, errorId }" name="url" label="链接" required>
        <InputText
          :id="id"
          :aria-describedby="errorId"
          maxlength="500"
          placeholder="https://…"
          fluid
        />
      </FormItem>

      <div class="flex justify-end gap-3 pt-1">
        <Button label="取消" severity="secondary" text :disabled="submitting" @click="close" />
        <Button label="提交" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
