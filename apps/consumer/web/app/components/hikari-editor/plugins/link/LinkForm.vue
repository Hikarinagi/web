<script setup lang="ts">
  import Form, { type FormSubmitEvent } from '@primevue/forms/form'
  import type { Editor } from '@tiptap/vue-3'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { linkResolver, type LinkValues } from './schema'

  const props = defineProps<{
    editor: Editor
    initialUrl?: string
    selectedText?: string
  }>()

  const { closeOverlay } = useEditorOverlays()
  const isEditing = computed(() => !!props.initialUrl?.length)

  const initialValues = computed<LinkValues>(() => ({
    url: props.initialUrl ?? '',
    text: props.selectedText ?? '',
  }))

  function onSubmit(event: FormSubmitEvent) {
    if (!event.valid) return
    const values = event.values as LinkValues
    const { editor } = props
    const url = values.url
    const displayText = values.text?.length ? values.text : null

    const { from, to } = editor.state.selection
    const hasRange = from !== to

    if (hasRange) {
      if (displayText && displayText !== props.selectedText) {
        editor
          .chain()
          .focus()
          .insertContentAt(
            { from, to },
            {
              type: 'text',
              text: displayText,
              marks: [{ type: 'link', attrs: { href: url } }],
            },
          )
          .run()
      } else {
        editor.chain().focus().setLink({ href: url }).run()
      }
    } else {
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: displayText ?? url,
          marks: [{ type: 'link', attrs: { href: url } }],
        })
        .run()
    }
    closeOverlay('link')
  }

  function onCancel() {
    closeOverlay('link')
  }
</script>

<template>
  <Form
    :resolver="linkResolver"
    :initial-values="initialValues"
    class="flex w-full flex-col gap-3 md:w-[360px]"
    @submit="onSubmit"
  >
    <FormItem v-slot="{ id, errorId }" name="url" label="URL" required>
      <InputText
        :id="id"
        autocomplete="off"
        autofocus
        fluid
        placeholder="https://... 或 /path"
        :aria-describedby="errorId"
        size="small"
      />
    </FormItem>

    <FormItem v-slot="{ id, errorId }" name="text" label="显示文字">
      <InputText
        :id="id"
        autocomplete="off"
        fluid
        :placeholder="selectedText || '可选,默认与 URL 一致'"
        :aria-describedby="errorId"
        size="small"
      />
    </FormItem>

    <div class="flex justify-end gap-2">
      <Button size="small" label="取消" severity="secondary" variant="text" @click="onCancel" />
      <Button size="small" :label="isEditing ? '更新' : '插入'" type="submit" />
    </div>
  </Form>
</template>
