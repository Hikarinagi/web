<script setup lang="ts">
  import { FormField, Input, Stack, Textarea } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiSaveSource' })

  const props = defineProps<{ id: number }>()
  const editor = inject(ENTRY_EDITOR)!
  const source = computed(
    () => editor.draft.value.contradicting[props.id] ?? { url: '', excerpt: '' },
  )
</script>

<template>
  <Stack gap="xs">
    <FormField :name="`${id}.url`">
      <Input
        :model-value="source.url"
        type="url"
        inputmode="url"
        placeholder="来源网址"
        aria-label="来源网址"
        @update:model-value="value => editor.contradict(id, { ...source, url: String(value) })"
      />
    </FormField>
    <FormField :name="`${id}.excerpt`">
      <Textarea
        :model-value="source.excerpt"
        :rows="2"
        autosize
        placeholder="摘录"
        aria-label="来源摘录"
        @update:model-value="value => editor.contradict(id, { ...source, excerpt: value ?? '' })"
      />
    </FormField>
  </Stack>
</template>
