<script setup lang="ts">
  import Form from '@primevue/forms/form'
  import { useRateForm } from '~/features/manga/useRateForm'
  import type { MangaRate, UpsertMangaRateBody } from '~/features/manga/rate'

  defineOptions({ name: 'MangaRateDialog' })

  const props = defineProps<{
    rate: MangaRate | null
    workTitle: string
    upsert: (body: UpsertMangaRateBody) => Promise<MangaRate | null>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { formErrors, form, submitting, isEdit, title, initialValues, submit, confirmDelete } =
    useRateForm({
      rate: () => props.rate,
      workTitle: () => props.workTitle,
      upsert: props.upsert,
      remove: props.remove,
      close: () => {
        visible.value = false
      },
    })

  watch(visible, async next => {
    if (!next) return
    formErrors.clear()
    await nextTick()
    form.value?.reset()
  })
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '480px' }"
    :pt="{ content: { class: 'px-0! pb-0!' } }"
  >
    <template #header>
      <span class="text-[17px] font-bold text-color">{{ title }}</span>
    </template>

    <Form
      ref="form"
      :resolver="formErrors.resolver"
      :initial-values="initialValues"
      class="flex flex-col"
      @input="formErrors.clear"
      @submit="submit"
    >
      <div class="flex flex-col gap-[22px] px-6 pb-6">
        <MangaRateStatusPills />
        <MangaRateScore />

        <FormItem v-slot="{ id }" name="rate_content" label="短评">
          <Textarea
            :id="id"
            rows="3"
            fluid
            auto-resize
            placeholder="聊聊剧情、作画、最戳你的桥段…一句话也行"
          />
        </FormItem>

        <FormItem v-slot="{ id }" name="is_spoiler">
          <div class="flex items-center gap-2.5">
            <Checkbox :input-id="id" binary />
            <label
              :for="id"
              class="cursor-pointer text-[13px] text-surface-600 dark:text-surface-300"
            >
              包含剧透
            </label>
          </div>
        </FormItem>
      </div>

      <div
        class="flex items-center gap-3 border-t border-surface-100 px-6 py-4 dark:border-surface-800"
      >
        <Button
          v-if="isEdit"
          label="删除"
          text
          severity="secondary"
          :disabled="submitting"
          class="text-surface-500!"
          @click="confirmDelete"
        />
        <span class="flex-1" />
        <Button
          :label="isEdit ? '保存' : '打个分'"
          type="submit"
          :loading="submitting"
          :disabled="submitting"
        />
      </div>
    </Form>
  </Dialog>
</template>
