<script setup lang="ts">
  import { Button, Dialog, Sheet } from '@hina-ui/vue'
  import type { PollEditorDef } from '~/features/interaction/usePollEditor'
  import { usePollEditor } from '~/features/interaction/usePollEditor'
  import type PollBuilderForm from './BuilderForm.vue'

  defineOptions({ name: 'PollEditDialog' })

  const narrow = useNarrow()
  const mounted = useMounted()
  const asSheet = computed(() => mounted.value && narrow.value)
  const panel = computed(() => (asSheet.value ? Sheet : Dialog))
  const panelProps = computed(() => (asSheet.value ? { class: 'h-[70dvh]' } : { size: 'md' }))

  const { state, close } = usePollEditor()
  const submitting = ref(false)
  const form = useTemplateRef<InstanceType<typeof PollBuilderForm>>('form')

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
      /* the request utility surfaces the error */
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <component
    :is="panel"
    v-model:open="visible"
    :title="state.mode === 'edit' ? '编辑投票' : '创建投票'"
    :locked="submitting"
    v-bind="panelProps"
  >
    <template #content>
      <PollBuilderForm
        ref="form"
        :initial="state.initial"
        :locked="state.locked"
        :submitting="submitting"
        @submit="onSubmit"
      />
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="close">取消</Button>
      <Button :loading="submitting" @click="form?.submit()">保存</Button>
    </template>
  </component>
</template>
