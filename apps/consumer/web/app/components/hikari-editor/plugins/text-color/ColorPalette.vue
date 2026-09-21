<script setup lang="ts">
  import { Button, Grid, Stack } from '@hina-ui/vue'
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
  <Stack gap="sm" class="w-full sm:w-45">
    <Grid :cols="5" gap="sm">
      <Button
        v-for="c in SWATCHES"
        :key="c.value"
        v-tooltip="c.label"
        :aria-label="c.label"
        icon-only
        pill
        size="sm"
        variant="outline"
        class="border-2"
        :class="activeColor === c.value ? 'border-accent' : 'border-transparent'"
        :style="{ backgroundColor: c.value }"
        @click="apply(c.value)"
      />
    </Grid>
    <Button variant="ghost" tone="neutral" size="sm" @click="clear">
      <template #icon><X /></template>
      清除颜色
    </Button>
  </Stack>
</template>
