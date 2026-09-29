<script setup lang="ts">
  import { Button, Form, FormField, Inline, Input } from '@hina-ui/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { rubySchema } from './schema'

  const props = defineProps<{ editor: Editor; initialReading?: string; base: string }>()

  const { closeOverlay } = useEditorOverlays()
  const values = reactive({ reading: props.initialReading ?? '' })

  function onSubmit() {
    props.editor.chain().focus().setMark('ruby', { reading: values.reading.trim() }).run()
    closeOverlay('ruby')
  }

  function remove() {
    props.editor.chain().focus().unsetMark('ruby').run()
    closeOverlay('ruby')
  }
</script>

<template>
  <Form :values="values" :rules="rubySchema" class="w-full sm:w-72" @submit="onSubmit">
    <FormField name="reading" :label="`为「${base}」注音`" required>
      <Input v-model="values.reading" autofocus size="sm" placeholder="读音" />
    </FormField>
    <Inline gap="xs" justify="end" class="mt-3">
      <Button v-if="initialReading" size="sm" variant="ghost" tone="danger" @click="remove">
        移除注音
      </Button>
      <Button size="sm" type="submit">确定</Button>
    </Inline>
  </Form>
</template>
