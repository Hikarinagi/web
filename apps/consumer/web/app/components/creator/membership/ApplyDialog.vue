<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Input,
    Select,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import type { SelectOption } from '@hina-ui/vue'
  import type { BackendReviewGroupCandidate } from '~/features/creator/membership'
  import type { MediaValue } from '~/components/media-library/types'
  import { applyReviewGroupSchema } from '~/features/creator/schemas/governance.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{ candidates: readonly BackendReviewGroupCandidate[] }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ submitted: [] }>()

  const groupOptions = computed<SelectOption<{ reason: string }>[]>(() =>
    props.candidates.map(c => ({
      value: c.id,
      label: c.name,
      description: c.description ?? undefined,
      disabled: c.is_member || c.has_pending_application,
      reason: c.is_member ? '已是成员' : c.has_pending_application ? '已有待处理申请' : '',
    })),
  )

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const pickedImages = ref<MediaValue[]>([])
  const values = reactive<{
    permission_group_id: number | null
    reason: string
    homepage: string
    images: number[]
  }>({ permission_group_id: null, reason: '', homepage: '', images: [] })

  watch(visible, next => {
    if (next) return
    form.value?.reset()
    pickedImages.value = []
    values.permission_group_id = null
    values.reason = ''
    values.homepage = ''
    values.images = []
  })

  function syncImages(next: MediaValue[]) {
    pickedImages.value = next
    values.images = next.map(m => m.id)
  }

  function appendPicked(picked: MediaValue[]) {
    const existing = new Set(pickedImages.value.map(m => m.id))
    syncImages([...pickedImages.value, ...picked.filter(m => !existing.has(m.id))].slice(0, 20))
  }

  async function onSubmit() {
    const groupId = values.permission_group_id
    if (groupId === null || submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/user/me/review-group-applications', {
        method: 'POST',
        body: {
          permission_group_id: groupId,
          reason: values.reason.trim(),
          homepage: values.homepage.trim() || undefined,
          images: values.images.length ? values.images : undefined,
        },
      })
      visible.value = false
      emit('submitted')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="申请加入审核组" size="lg" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="applyReviewGroupSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField name="permission_group_id" label="目标审核组" required>
          <Select
            v-model="values.permission_group_id"
            :options="groupOptions"
            placeholder="选择想要加入的审核组"
          >
            <template #option="{ option }">
              <Stack as="span" gap="none" class="min-w-0">
                <Text as="span" size="sm" weight="medium" truncate>{{ option.label }}</Text>
                <Text v-if="option.description" as="span" size="xs" tone="muted" truncate>
                  {{ option.description }}
                </Text>
                <Text v-if="option.reason" as="span" size="xs" class="text-warning-text">
                  {{ option.reason }}
                </Text>
              </Stack>
            </template>
          </Select>
        </FormField>

        <FormField name="reason" label="申请理由" required>
          <Textarea v-model="values.reason" autosize placeholder="说明加入意愿、相关经验等" />
        </FormField>

        <FormField name="homepage" label="个人主页（可选）">
          <Input v-model="values.homepage" autocomplete="off" placeholder="https://..." />
        </FormField>

        <FormField name="images" label="作品/证明（可选）">
          <MediaLibrarySelection
            :model-value="pickedImages"
            class="sm:grid-cols-[repeat(auto-fill,minmax(7rem,1fr))]"
            @update:model-value="syncImages"
          >
            <template v-if="pickedImages.length < 20" #add>
              <MediaLibraryAdd
                mode="multiple"
                :max="20 - pickedImages.length"
                @pick="appendPicked"
              />
            </template>
          </MediaLibrarySelection>
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">提交申请</Button>
    </template>
  </Dialog>
</template>
