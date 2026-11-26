<script setup lang="ts">
  import { FormField, Input, Stack, Textarea } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiSaveSource' })

  const props = defineProps<{ id?: number; entry?: number }>()
  const editor = inject(ENTRY_EDITOR)!
  const key = computed(() => (props.entry === undefined ? `${props.id}` : `entry-${props.entry}`))
  const source = computed(
    () =>
      (props.entry === undefined
        ? editor.draft.value.contradicting[props.id!]
        : editor.draft.value.deleted[props.entry]) ?? { url: '', excerpt: '' },
  )
  function update(next: { url: string; excerpt: string }) {
    if (props.entry === undefined) editor.contradict(props.id!, next)
    else editor.refute(props.entry, next)
  }
</script>

<template>
  <Stack gap="xs">
    <FormField :name="`${key}.url`">
      <Input
        :model-value="source.url"
        type="url"
        inputmode="url"
        placeholder="来源网址"
        aria-label="来源网址"
        @update:model-value="value => update({ ...source, url: String(value) })"
      />
    </FormField>
    <FormField :name="`${key}.excerpt`">
      <Textarea
        :model-value="source.excerpt"
        :rows="2"
        autosize
        placeholder="摘录"
        aria-label="来源摘录"
        @update:model-value="value => update({ ...source, excerpt: value ?? '' })"
      />
    </FormField>
  </Stack>
</template>
