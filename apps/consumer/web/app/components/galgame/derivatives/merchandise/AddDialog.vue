<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { MediaValue } from '~/components/media-library/types'
  import {
    galgameMerchResolver,
    type GalgameMerchValues,
  } from '~/features/galgame/schemas/derivatives.schema'
  import { useMerchMutations } from '~/features/galgame/useMerchMutations'

  defineOptions({ name: 'GalgameDerivativesMerchandiseAddDialog' })
  const props = defineProps<{ galgameId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { submitting, create } = useMerchMutations(props.galgameId)
  const formErrors = useFormErrors(galgameMerchResolver)
  const form = useTemplateRef<FormInstance>('form')
  // 媒体库选择器以 MediaValue 为模型,表单字段只提交 image_id
  const pickedImage = ref<MediaValue | null>(null)

  watch(visible, next => {
    if (!next) return
    formErrors.clear()
    pickedImage.value = null
    form.value?.reset()
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    const values = event.values as GalgameMerchValues
    try {
      await create({
        name: values.name,
        image_id: values.image_id ?? undefined,
        category: values.category?.length ? values.category : undefined,
        description: values.description?.length ? values.description : undefined,
        labels: values.labels?.length ? values.labels : undefined,
        staffs: values.staffs?.length
          ? values.staffs.map(staff => ({ role: staff.key, name: staff.value }))
          : undefined,
      })
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
    header="添加制品"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '34rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id, errorId }" name="name" label="名称" required>
        <InputText :id="id" :aria-describedby="errorId" maxlength="80" fluid />
      </FormItem>

      <FormItem v-slot="{ field }" name="image_id" label="图片">
        <MediaLibraryPicker
          :model-value="pickedImage"
          @update:model-value="
            value => {
              pickedImage = value
              field.props.onInput({ value: value?.id ?? null })
            }
          "
        />
      </FormItem>

      <FormItem v-slot="{ id, errorId }" name="category" label="定位">
        <InputText
          :id="id"
          :aria-describedby="errorId"
          maxlength="30"
          placeholder="如 实体出版 / 设定集 / 同人"
          fluid
        />
      </FormItem>

      <FormItem v-slot="{ id, errorId }" name="description" label="描述">
        <Textarea :id="id" :aria-describedby="errorId" rows="3" maxlength="500" auto-resize fluid />
      </FormItem>

      <FormItem
        v-slot="{ field }"
        name="labels"
        label="其他信息"
        description="键值对,如 规格 / A4·44P"
        :initial-value="[]"
      >
        <GalgameDerivativesMerchandisePairListField
          :model-value="field.value"
          key-placeholder="键名"
          value-placeholder="内容"
          add-label="添加一条"
          @update:model-value="value => field.props.onInput({ value })"
        />
      </FormItem>

      <FormItem
        v-slot="{ field }"
        name="staffs"
        label="制作信息"
        description="职责 + 名称,如 画师 / 某某"
        :initial-value="[]"
      >
        <GalgameDerivativesMerchandisePairListField
          :model-value="field.value"
          key-placeholder="职责"
          value-placeholder="名称"
          add-label="添加一条"
          @update:model-value="value => field.props.onInput({ value })"
        />
      </FormItem>

      <div class="flex justify-end gap-3 pt-1">
        <Button label="取消" severity="secondary" text :disabled="submitting" @click="close" />
        <Button label="提交" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
