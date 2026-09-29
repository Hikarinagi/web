<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    toast,
  } from '@hina-ui/vue'
  import { rejectProjectSchema } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = withDefaults(defineProps<{ projectId: number; kind?: 'novel' | 'manga' }>(), {
    kind: 'novel',
  })
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ rejected: [] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ reason: '' })

  const notes = ref<{ id: number; content: string }[]>([])

  watch(visible, async next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
    notes.value = []
    const request = { path: { project_id: props.projectId }, toast: false }
    const review =
      props.kind === 'manga'
        ? await hikariRequest('/api/v3/manga-projects/{project_id}/review', request).catch(
            () => null,
          )
        : await hikariRequest('/api/v3/novel-projects/{project_id}/review', request).catch(
            () => null,
          )
    notes.value = review?.notes ?? []
  })

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const request = {
        method: 'post' as const,
        path: { project_id: props.projectId },
        body: { reason: values.reason.trim() },
      }
      if (props.kind === 'manga') {
        await hikariRequest('/api/v3/manga-projects/{project_id}/reject', request)
      } else {
        await hikariRequest('/api/v3/novel-projects/{project_id}/reject', request)
      }
      toast.success('该投稿已被退回。其成员将收到通知。')
      visible.value = false
      emit('rejected')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="退回投稿" size="sm" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="rejectProjectSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="md">
          <Stack v-if="notes.length" gap="sm">
            <Text size="sm" weight="medium">本次审核的批注 · {{ notes.length }}</Text>
            <Text size="xs" tone="muted">
              这些批注连同你的退回原因一起发送给投稿者，投稿者可以跳转到每一条批注。
            </Text>
            <ScrollArea class="max-h-48">
              <Stack gap="xs">
                <Text
                  v-for="note in notes"
                  :key="note.id"
                  size="sm"
                  class="rounded-md bg-subtle px-3 py-2"
                >
                  {{ note.content }}
                </Text>
              </Stack>
            </ScrollArea>
          </Stack>
          <FormField name="reason" label="退回原因" required>
            <Textarea v-model="values.reason" :rows="4" placeholder="描述所需的改变" />
          </FormField>
        </Stack>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="visible = false">
        取消
      </Button>
      <Button tone="danger" :loading="submitting" @click="form?.submit()">退回</Button>
    </template>
  </Dialog>
</template>
