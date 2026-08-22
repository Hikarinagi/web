<script setup lang="ts">
  import Form from '@primevue/forms/form'
  import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
  import {
    volumeRateResolver,
    type VolumeRateValues,
  } from '~/features/light-novel-volume/schemas/rate.schema'
  import type {
    LightNovelVolumeRate,
    UpsertLightNovelVolumeRateBody,
  } from '~/features/light-novel-volume/rate'

  defineOptions({ name: 'LightNovelVolumeRateDialog' })

  const props = defineProps<{
    rate: LightNovelVolumeRate | null
    volumeTitle: string
    upsert: (body: UpsertLightNovelVolumeRateBody) => Promise<unknown>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const confirm = useConfirm()
  const formErrors = useFormErrors(volumeRateResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  const isEdit = computed(() => props.rate?.rate != null)
  const title = computed(() =>
    isEdit.value ? `编辑「${props.volumeTitle}」的评分` : `给「${props.volumeTitle}」评分`,
  )
  const initialValues = computed(() => ({
    rate: props.rate?.rate ?? 8,
    rate_content: props.rate?.rate_content ?? '',
    is_spoiler: props.rate?.is_spoiler ?? false,
  }))

  async function submit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as VolumeRateValues
      await props.upsert({
        rate: values.rate,
        rate_content: values.rate_content ?? '',
        is_spoiler: values.is_spoiler,
      })
      visible.value = false
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '删除评分',
      message: '删除后，你对这一卷的评分会移除。确定删除吗？',
      acceptLabel: '删除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        await props.remove()
        visible.value = false
      },
    })
  }

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
    :style="{ width: '92vw', maxWidth: '460px' }"
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
        <FormItem v-slot="{ field }" name="rate" label="评分" required>
          <div class="flex flex-col gap-2">
            <Slider
              :model-value="field.value as number"
              :min="1"
              :max="10"
              :step="1"
              @update:model-value="value => field.props.onInput({ value })"
            />
            <div class="flex items-center gap-2 text-[11px] text-surface-400">
              <span>1</span>
              <span class="flex-1" />
              <span
                class="rounded-md bg-hikari-primary-50 px-2.5 py-0.5 text-sm font-semibold text-hikari-primary-800 tabular-nums dark:bg-hikari-primary-950 dark:text-hikari-primary-300"
              >
                {{ (field.value as number)?.toFixed(1) }}
              </span>
              <span class="flex-1" />
              <span>10</span>
            </div>
          </div>
        </FormItem>

        <FormItem v-slot="{ id }" name="rate_content" label="短评">
          <Textarea
            :id="id"
            rows="3"
            fluid
            auto-resize
            placeholder="这一卷读下来如何？一句话也行"
          />
        </FormItem>

        <FormItem v-slot="{ id }" name="is_spoiler">
          <div class="flex items-center gap-2.5">
            <Checkbox
              :input-id="id"
              binary
            />
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
          <Button label="保存" type="submit" :loading="submitting" />
        </template>
        <Button v-else label="打个分" type="submit" :loading="submitting" fluid />
      </div>
    </Form>
  </Dialog>
</template>
