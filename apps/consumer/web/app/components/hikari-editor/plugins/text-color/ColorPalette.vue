<script setup lang="ts">
  import { X } from '@lucide/vue'
  import type { Editor } from '@tiptap/vue-3'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'

  const props = defineProps<{ editor: Editor }>()

  const SWATCHES: { value: string; label: string }[] = [
    { value: '#e5484d', label: '红' },
    { value: '#f76b15', label: '橙' },
    { value: '#f5b800', label: '黄' },
    { value: '#30a46c', label: '绿' },
    { value: '#00a2c7', label: '青' },
    { value: '#3b82f6', label: '蓝' },
    { value: '#8e4ec6', label: '紫' },
    { value: '#e93d82', label: '粉' },
    { value: '#6b7280', label: '灰' },
  ]

  const { closeOverlay } = useEditorOverlays()

  const activeColor = computed(
    () => props.editor.getAttributes('text_style').color as string | undefined,
  )

  function apply(color: string) {
    props.editor.chain().focus().setMark('text_style', { color }).run()
    closeOverlay('text-color')
  }

  function clear() {
    props.editor.chain().focus().unsetMark('text_style').run()
    closeOverlay('text-color')
  }
</script>

<template>
  <div class="flex w-[180px] flex-col gap-3">
    <div class="grid grid-cols-5 gap-2">
      <Button
        v-for="c in SWATCHES"
        :key="c.value"
        v-tooltip.top="c.label"
        :aria-label="c.label"
        rounded
        class="h-7! w-7! border-2! p-0!"
        :class="activeColor === c.value ? 'border-primary!' : 'border-transparent!'"
        :style="{ backgroundColor: c.value }"
        @click="apply(c.value)"
      />
    </div>
    <Button size="small" severity="secondary" variant="text" label="清除颜色" @click="clear">
      <template #icon>
        <X :size="14" />
      </template>
    </Button>
  </div>
</template>
