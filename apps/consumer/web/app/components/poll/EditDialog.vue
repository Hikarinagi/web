<script setup lang="ts">
  import type { PollEditorDef } from '~/features/interaction/usePollEditor'
  import { usePollEditor } from '~/features/interaction/usePollEditor'

  defineOptions({ name: 'PollEditDialog' })

  const { state, close } = usePollEditor()
  const submitting = ref(false)

  const visible = computed({
    get: () => state.value.visible,
    set: value => {
      if (!value && !submitting.value) close()
    },
  })

  async function onSubmit(def: PollEditorDef) {
    if (submitting.value) return
    submitting.value = true
    try {
      await state.value.onSave?.(def)
      close()
    } catch {
      /* notivue surfaces the error */
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="state.mode === 'edit' ? '编辑投票' : '创建投票'"
    class="w-full max-w-md"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
  >
    <PollBuilderForm
      v-if="state.visible"
      :initial="state.initial"
      :locked="state.locked"
      :submitting="submitting"
      @submit="onSubmit"
      @cancel="close"
    />
  </Dialog>
</template>
