<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import type { BackendReviewGroupCandidate } from '~/features/creator/membership'
  import type { MediaValue } from '~/components/media-library/types'
  import {
    applyReviewGroupResolver,
    type ApplyReviewGroupValues,
  } from '~/features/creator/schemas/governance.schema'

  const props = defineProps<{ candidates: readonly BackendReviewGroupCandidate[] }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ submitted: [] }>()

  const groupOptions = computed(() =>
    props.candidates.map(c => ({
      value: c.id,
      label: c.name,
      description: c.description,
      disabled: c.is_member || c.has_pending_application,
      reason: c.is_member ? '已是成员' : c.has_pending_application ? '已有待处理申请' : '',
    })),
  )

  const formErrors = useFormErrors(applyReviewGroupResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const pickedImages = ref<MediaValue[]>([])

  watch(visible, next => {
    if (next) {
      formErrors.clear()
      pickedImages.value = []
      form.value?.reset()
    }
  })

  function syncImageIds(next: MediaValue[], onInput: (event: { value: number[] }) => void) {
    pickedImages.value = next
    onInput({ value: next.map(m => m.id) })
  }

  function appendPicked(picked: MediaValue[], onInput: (event: { value: number[] }) => void) {
    const existing = new Set(pickedImages.value.map(m => m.id))
    const next = [...pickedImages.value, ...picked.filter(m => !existing.has(m.id))].slice(0, 20)
    syncImageIds(next, onInput)
  }

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as ApplyReviewGroupValues
      await hikariRequest('/api/v3/user/me/review-group-applications', {
        method: 'POST',
        body: {
          permission_group_id: values.permission_group_id,
          reason: values.reason,
          homepage: values.homepage?.length ? values.homepage : undefined,
          images: values.images?.length ? values.images : undefined,
        },
      })
      visible.value = false
      emit('submitted')
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
    header="申请加入审核组"
    :dismissable-mask="!submitting"
    :style="{ width: '92vw', maxWidth: '32rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ id }" name="permission_group_id" label="目标审核组" required>
        <Select
          :input-id="id"
          :options="groupOptions"
          option-label="label"
          option-value="value"
          option-disabled="disabled"
          placeholder="选择想要加入的审核组"
          fluid
        >
          <template #option="{ option }">
            <div class="flex flex-col">
              <span class="font-medium">{{ option.label }}</span>
              <span v-if="option.description" class="text-xs text-muted-color">
                {{ option.description }}
              </span>
              <span v-if="option.reason" class="text-xs text-amber-600 dark:text-amber-400">
                {{ option.reason }}
              </span>
            </div>
          </template>
        </Select>
      </FormItem>

      <FormItem v-slot="{ id }" name="reason" label="申请理由" required>
        <Textarea :id="id" rows="4" fluid placeholder="说明加入意愿、相关经验等" />
      </FormItem>

      <FormItem v-slot="{ id }" name="homepage" label="个人主页(可选)">
        <InputText :id="id" autocomplete="off" fluid placeholder="https://..." />
      </FormItem>

      <FormItem v-slot="{ field }" name="images" label="作品/证明(可选)" :initial-value="[]">
        <MediaLibrarySelection
          :model-value="pickedImages"
          class="sm:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]"
          @update:model-value="next => syncImageIds(next, field.props.onInput)"
        >
          <template v-if="pickedImages.length < 20" #add>
            <MediaLibraryAdd
              mode="multiple"
              :max="20 - pickedImages.length"
              @pick="picks => appendPicked(picks, field.props.onInput)"
            />
          </template>
        </MediaLibrarySelection>
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="visible = false" />
        <Button label="提交申请" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>
