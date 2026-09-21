<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { Blockquote, Button, Dialog, Inline, Stack, Text, Textarea } from '@hina-ui/vue'
  import { NotebookPen } from '@lucide/vue'
  import { DEFAULT_ANNOTATION_COLOR } from '../composables/useReaderAnnotations'

  defineOptions({ name: 'HikariReaderAnnotationNoteDialog' })

  interface NoteDialogSubmitPayload {
    note: string | null
    color?: string
  }

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit'
      initialNote?: string | null
      initialColor?: string | null
      preview?: string | null
      showColor?: boolean
    }>(),
    {
      mode: 'create',
      initialNote: null,
      initialColor: null,
      preview: null,
      showColor: false,
    },
  )

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    submit: [payload: NoteDialogSubmitPayload]
  }>()

  const note = ref('')
  const color = ref<string>(DEFAULT_ANNOTATION_COLOR)
  const creating = computed(() => props.mode === 'create')

  watch(visible, value => {
    if (!value) return
    note.value = props.initialNote ?? ''
    color.value = props.initialColor ?? DEFAULT_ANNOTATION_COLOR
  })

  function submit() {
    const trimmed = note.value.trim()
    emit('submit', {
      note: trimmed.length ? trimmed : null,
      color: props.showColor ? color.value : undefined,
    })
    visible.value = false
  }

  function cancel() {
    visible.value = false
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="creating ? '添加标注' : '编辑标注'">
    <template #icon><NotebookPen /></template>

    <template #content>
      <Stack gap="sm">
        <Blockquote v-if="preview" class="line-clamp-3 text-sm">{{ preview }}</Blockquote>

        <Inline
          v-if="showColor"
          gap="sm"
          align="center"
          justify="between"
          class="rounded-md border border-line px-3 py-2"
        >
          <Text as="span" size="sm" tone="muted">颜色</Text>
          <HikariReaderAnnotationColorPicker v-model="color" />
        </Inline>

        <Textarea
          v-model="note"
          autosize
          autofocus
          aria-label="标注内容"
          placeholder="记录想法..."
        />
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" @click="cancel">取消</Button>
      <Button @click="submit">{{ creating ? '添加' : '保存' }}</Button>
    </template>
  </Dialog>
</template>
