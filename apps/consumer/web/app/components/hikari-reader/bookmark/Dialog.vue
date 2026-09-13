<script setup lang="ts">
  import { BookmarkPlus, Pencil } from '@lucide/vue'
  import { ref, watch } from 'vue'

  defineOptions({ name: 'HikariReaderBookmarkDialog' })

  const props = withDefaults(
    defineProps<{
      mode?: 'create' | 'edit'
      initialNote?: string | null
    }>(),
    {
      mode: 'create',
      initialNote: null,
    },
  )

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{
    submit: [note: string | null]
  }>()

  const note = ref('')

  watch(visible, value => {
    if (value) note.value = props.initialNote ?? ''
  })

  function submit() {
    const trimmed = note.value.trim()
    emit('submit', trimmed.length ? trimmed : null)
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
        <BookmarkPlus v-if="mode === 'create'" :size="18" class="text-primary" aria-hidden="true" />
        <Pencil v-else :size="18" class="text-primary" aria-hidden="true" />
        <span class="text-base font-semibold">
          {{ mode === 'create' ? '添加书签' : '编辑书签' }}
        </span>
      </div>
    </template>

    <div class="space-y-2">
      <p class="text-sm text-muted-color">
        {{
          mode === 'create' ? '写点什么，留空也可以直接添加' : '修改书签备注，清空可以移除原有备注'
        }}
      </p>
      <Textarea
        v-model="note"
        rows="3"
        auto-resize
        class="w-full"
        placeholder="记录点什么..."
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
