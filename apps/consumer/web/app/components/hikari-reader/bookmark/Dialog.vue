<script setup lang="ts">
  import { computed, ref, watch } from 'vue'
  import { Button, Dialog, Textarea } from '@hina-ui/vue'
  import { BookmarkPlus, Pencil } from '@lucide/vue'

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
  const creating = computed(() => props.mode === 'create')

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
    v-model:open="visible"
    :title="creating ? '添加书签' : '编辑书签'"
    :description="creating ? '写点什么，留空也可以直接添加' : '修改书签备注，清空可以移除原有备注'"
  >
    <template #icon>
      <BookmarkPlus v-if="creating" />
      <Pencil v-else />
    </template>

    <template #content>
      <Textarea
        v-model="note"
        autosize
        autofocus
        aria-label="书签备注"
        placeholder="记录点什么..."
      />
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" @click="cancel">取消</Button>
      <Button @click="submit">{{ creating ? '添加' : '保存' }}</Button>
    </template>
  </Dialog>
</template>
