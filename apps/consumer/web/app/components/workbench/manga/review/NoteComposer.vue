<script setup lang="ts">
  import { Button, Form, FormField, Inline, Popover, Stack, Textarea } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { mangaNoteSchema } from '~/features/workbench/manga/schemas/manga.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const { pending, notes, focus, state } = useMangaReview()
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ content: '' })
  const saving = ref(false)
  const open = computed({
    get: () => !!pending.value,
    set: value => {
      if (!value && !saving.value) pending.value = null
    },
  })
  const number = computed(
    () => state.rows.value.find(row => row.page.id === pending.value?.page_id)?.number ?? '',
  )

  watch(pending, next => {
    if (!next) return
    form.value?.reset()
    values.content = ''
  })

  async function onSubmit() {
    const target = pending.value
    if (!target || saving.value) return
    saving.value = true
    try {
      const note = await hikariRequest('/api/v3/manga-project-pages/{page_id}/notes', {
        method: 'post',
        path: { page_id: target.page_id },
        body: { content: values.content.trim(), rect: target.rect },
      })
      notes.value = [...notes.value, note]
      focus.value = { page_id: note.page_id, rect: note.rect }
      pending.value = null
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      saving.value = false
    }
  }
</script>

<template>
  <Popover
    v-model:open="open"
    :anchor="pending?.anchor ?? null"
    :modal="false"
    side="right"
    align="start"
    aria-label="新批注"
  >
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="mangaNoteSchema"
        :disabled="saving"
        class="w-72"
        @submit="onSubmit"
      >
        <Stack gap="sm">
          <FormField name="content" :label="`第 ${number} 页 · 新批注`">
            <Textarea v-model="values.content" :rows="3" />
          </FormField>
          <Inline gap="sm" justify="end">
            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              :disabled="saving"
              @click="open = false"
            >
              取消
            </Button>
            <Button size="sm" :loading="saving" @click="form?.submit()">保存</Button>
          </Inline>
        </Stack>
      </Form>
    </template>
  </Popover>
</template>
