<script setup lang="ts">
  import { Button, Form, FormField, Inline, Input } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { linkSchema } from './schema'

  const props = defineProps<{
    editor: Editor
    initialUrl?: string
    selectedText?: string
  }>()

  const { closeOverlay } = useEditorOverlays()
  const isEditing = computed(() => !!props.initialUrl?.length)

  const values = reactive({
    url: props.initialUrl ?? '',
    text: props.selectedText ?? '',
  })

  function onSubmit() {
    const { editor } = props
    const url = values.url.trim()
    const text = values.text.trim()
    const displayText = text.length ? text : null

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
  <Form :values="values" :rules="linkSchema" class="w-full sm:w-90" @submit="onSubmit">
    <FormField name="url" label="URL" required>
      <Input
        v-model="values.url"
        size="sm"
        autocomplete="off"
        autofocus
        placeholder="https://... 或 /path"
      />
    </FormField>

    <FormField name="text" label="显示文字">
      <Input
        v-model="values.text"
        size="sm"
        autocomplete="off"
        :placeholder="selectedText || '可选，默认与 URL 一致'"
      />
    </FormField>

    <Inline gap="sm" justify="end">
      <Button size="sm" variant="ghost" tone="neutral" @click="onCancel">取消</Button>
      <Button size="sm" type="submit">{{ isEditing ? '更新' : '插入' }}</Button>
    </Inline>
  </Form>
</template>
