<script setup lang="ts">
  import { PenLine } from '@lucide/vue'
  import Form from '@primevue/forms/form'
  import { useRateForm } from '~/features/galgame/useRateForm'
  import type { GalgameRate, UpsertGalgameRateBody } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameRateDialog' })

  const props = defineProps<{
    galgameId: number
    rate: GalgameRate | null
    workTitle: string
    upsert: (body: UpsertGalgameRateBody) => Promise<GalgameRate | null>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const {
    formErrors,
    form,
    submitting,
    detailOpen,
    pendingReview,
    reviewing,
    isEdit,
    title,
    initialValues,
    prepare,
    submit,
    confirmDelete,
  } = useRateForm({
    rate: () => props.rate,
    workTitle: () => props.workTitle,
    upsert: props.upsert,
    remove: props.remove,
    close: () => {
      visible.value = false
    },
    onReview: saved => {
      visible.value = false
      if (saved?.id != null) {
        void navigateTo({
          path: '/articles/new',
          query: { galgame_rate_id: saved.id, work_title: props.workTitle },
        })
      }
    },
  })

  watch(visible, async next => {
    if (!next) return
    prepare()
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
        <GalgameRateStatusPills />
        <GalgameRateScore />
        <FormItem v-slot="{ id, field }" name="time_to_finish_hours" label="玩了多久">
          <div class="flex items-center gap-2">
            <InputNumber
              :input-id="id"
              :model-value="field.value"
              :min="0"
              :max="9999"
              :max-fraction-digits="1"
              fluid
              @update:model-value="value => field.props.onInput({ value })"
            />
            <span class="shrink-0 text-[13px] text-surface-500">小时</span>
          </div>
        </FormItem>

        <FormItem v-slot="{ id }" name="rate_content" label="短评">
          <Textarea
            :id="id"
            rows="3"
            fluid
            auto-resize
            placeholder="聊聊剧本、节奏、印象最深的桥段…一句话也行"
          />
        </FormItem>

        <FormItem v-slot="{ id, field }" name="is_spoiler">
          <div class="flex items-center gap-2.5">
            <Checkbox
              :input-id="id"
              :model-value="field.value as boolean"
              binary
              @update:model-value="value => field.props.onInput({ value })"
            />
            <label
              :for="id"
              class="cursor-pointer text-[13px] text-surface-600 dark:text-surface-300"
            >
              包含剧透
            </label>
          </div>
        </FormItem>

        <GalgameRateDimensions v-model:open="detailOpen" />
      </div>

      <div
        class="flex items-center gap-3 border-t border-surface-100 px-6 py-4 dark:border-surface-800"
      >
        <template v-if="isEdit">
          <Button
            label="删除"
            text
            severity="secondary"
            :disabled="submitting"
            class="text-surface-500!"
            @click="confirmDelete"
          />
          <span class="flex-1" />
          <Button
            label="写长评"
            text
            severity="secondary"
            type="submit"
            :loading="reviewing"
            :disabled="submitting"
            @click="pendingReview = true"
          >
            <template #icon><PenLine class="size-4" /></template>
          </Button>
          <Button
            label="保存"
            type="submit"
            :loading="submitting && !reviewing"
            :disabled="submitting"
          />
        </template>
        <template v-else>
          <Button
            label="写长评"
            text
            severity="secondary"
            type="submit"
            :loading="reviewing"
            :disabled="submitting"
            @click="pendingReview = true"
          >
            <template #icon><PenLine class="size-4" /></template>
          </Button>
          <span class="flex-1" />
          <Button
            label="打个分"
            type="submit"
            :loading="submitting && !reviewing"
            :disabled="submitting"
          />
        </template>
      </div>
    </Form>
  </Dialog>
</template>
