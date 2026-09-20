<script setup lang="ts">
  import { NotebookPen } from '@lucide/vue'
  import { ref, watch } from 'vue'
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
  <Dialog
    v-model:visible="visible"
    modal
    :draggable="false"
    :close-on-escape="true"
    :dismissable-mask="true"
    class="mx-4 w-[calc(100vw-2rem)] max-w-md"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <NotebookPen :size="18" class="text-primary" aria-hidden="true" />
        <span class="text-base font-semibold">
          {{ mode === 'create' ? '添加标注' : '编辑标注' }}
        </span>
      </div>
    </template>

    <div class="space-y-3">
      <div v-if="preview" class="rounded-md bg-surface-100 px-3 py-2 dark:bg-surface-800">
        <p class="line-clamp-3 text-sm leading-6 text-muted-color">
          {{ preview }}
        </p>
      </div>
      <div
        v-if="showColor"
        class="flex items-center justify-between gap-3 rounded-md border border-surface-200 px-3 py-2 dark:border-surface-700"
      >
        <span class="text-sm text-muted-color">颜色</span>
        <HikariReaderAnnotationColorPicker v-model="color" />
      </div>
      <Textarea
        v-model="note"
        rows="3"
        auto-resize
        class="w-full"
        placeholder="记录想法..."
        autofocus
      />
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button label="取消" severity="secondary" variant="text" @click="cancel" />
        <Button :label="mode === 'create' ? '添加' : '保存'" @click="submit" />
      </div>
    </template>
  </Dialog>
</template>
