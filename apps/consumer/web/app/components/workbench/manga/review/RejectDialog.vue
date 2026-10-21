<script setup lang="ts">
  import {
    Button,
    Dialog,
    Form,
    FormField,
    Heading,
    Inline,
    Link,
    ScrollArea,
    Stack,
    Text,
    Textarea,
    toast,
  } from '@hina-ui/vue'
  import type { BackendMangaNote } from '~/features/workbench/manga/manga'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { rejectProjectSchema } from '~/features/workbench/schemas/workbench.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const visible = defineModel<boolean>('visible', { required: true })

  const { project, notes, state, openNote } = useMangaReview()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive({ reason: '' })
  const numbers = computed(() => new Map(state.rows.value.map(row => [row.page.id, row.number])))

  watch(visible, next => {
    if (!next) return
    form.value?.reset()
    values.reason = ''
  })

  function view(note: BackendMangaNote) {
    visible.value = false
    openNote(note)
  }

  async function onSubmit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await hikariRequest('/api/v3/manga-projects/{project_id}/reject', {
        method: 'post',
        path: { project_id: project.value.id },
        body: { reason: values.reason.trim() },
      })
      toast.success('该投稿已被退回。其成员将收到通知。')
      visible.value = false
      await navigateTo('/create/manga-review')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="visible" title="退回投稿" size="md" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="rejectProjectSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <Stack gap="lg">
          <FormField name="reason" label="退回原因" required>
            <Textarea v-model="values.reason" :rows="4" />
          </FormField>
          <Stack v-if="notes.length" as="section" gap="sm">
            <Inline gap="sm" align="baseline">
              <Heading :level="3" size="sm">本次审核的批注</Heading>
              <Text size="sm" tone="muted" class="tabular-nums">{{ notes.length }}</Text>
            </Inline>
            <ScrollArea class="max-h-48">
              <Stack as="ul" gap="xs">
                <Inline
                  v-for="note in notes"
                  :key="note.id"
                  as="li"
                  gap="sm"
                  align="baseline"
                  :wrap="false"
                  class="rounded-md bg-subtle px-3 py-2"
                >
                  <Text size="sm" weight="medium" class="shrink-0 tabular-nums">
                    第 {{ numbers.get(note.page_id) ?? '?' }} 页
                  </Text>
                  <Text size="sm" truncate class="min-w-0 flex-1">{{ note.content }}</Text>
                  <Link as="button" type="button" class="shrink-0 text-sm" @click="view(note)">
                    查看
                  </Link>
                </Inline>
              </Stack>
            </ScrollArea>
          </Stack>
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
