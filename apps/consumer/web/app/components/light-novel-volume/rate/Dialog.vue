<script setup lang="ts">
  import {
    AlertDialog,
    Button,
    Checkbox,
    Dialog,
    Form,
    FormField,
    FormLayout,
    Space,
    Textarea,
  } from '@hina-ui/vue'
  import {
    volumeRateSchema,
    type VolumeRateValues,
  } from '~/features/light-novel-volume/schemas/rate.schema'
  import type {
    LightNovelVolumeRate,
    UpsertLightNovelVolumeRateBody,
  } from '~/features/light-novel-volume/rate'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'LightNovelVolumeRateDialog' })

  const props = defineProps<{
    rate: LightNovelVolumeRate | null
    volumeTitle: string
    upsert: (body: UpsertLightNovelVolumeRateBody) => Promise<unknown>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)

  const values = reactive<VolumeRateValues>({
    rate: 8,
    rate_content: '',
    is_spoiler: false,
  })

  const isEdit = computed(() => props.rate?.rate != null)
  const title = computed(() =>
    isEdit.value ? `编辑「${props.volumeTitle}」的评分` : `给「${props.volumeTitle}」评分`,
  )

  async function prepare() {
    values.rate = props.rate?.rate ?? 8
    values.rate_content = props.rate?.rate_content ?? ''
    values.is_spoiler = props.rate?.is_spoiler ?? false
    await nextTick()
    form.value?.reset()
  }

  async function submit() {
    if (submitting.value || values.rate == null) return
    submitting.value = true
    try {
      await props.upsert({
        rate: values.rate,
        rate_content: values.rate_content.trim(),
        is_spoiler: values.is_spoiler,
      })
      visible.value = false
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  async function removeRate() {
    await props.remove()
    visible.value = false
  }

  watch(visible, next => {
    if (next) void prepare()
  })
</script>

<template>
  <Dialog v-model:open="visible" :title="title" :locked="submitting">
    <template #content>
      <Form ref="form" :values="values" :rules="volumeRateSchema" @submit="submit">
        <FormLayout>
          <WorkRateScore v-model="values.rate" required />

          <FormField name="rate_content" label="短评">
            <Textarea
              v-model="values.rate_content"
              :rows="3"
              autosize
              placeholder="这一卷读下来如何？一句话也行"
              class="w-full"
            />
          </FormField>

          <Checkbox v-model="values.is_spoiler">包含剧透</Checkbox>
        </FormLayout>
      </Form>
    </template>

    <template #footer>
      <template v-if="isEdit">
        <AlertDialog
          title="删除评分"
          description="删除后，你对这一卷的评分会移除。"
          tone="danger"
          confirm-text="删除"
          cancel-text="再想想"
          @confirm="removeRate"
        >
          <Button variant="ghost" tone="danger" :disabled="submitting">删除</Button>
        </AlertDialog>
        <Space size="flex" />
        <Button :loading="submitting" :disabled="submitting" @click="form?.submit()">保存</Button>
      </template>
      <Button v-else block :loading="submitting" :disabled="submitting" @click="form?.submit()">
        打个分
      </Button>
    </template>
  </Dialog>
</template>
