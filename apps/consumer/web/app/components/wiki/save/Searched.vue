<script setup lang="ts">
  import { FormField, Textarea } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiSaveSearched' })

  const props = defineProps<{ id: number }>()
  const editor = inject(ENTRY_EDITOR)!
  const places = computed(() => editor.draft.value.searched[props.id] ?? '')
</script>

<template>
  <FormField :name="`${id}.searched`">
    <Textarea
      :model-value="places"
      :rows="2"
      autosize
      placeholder="查过哪些地方，各处如何记载"
      aria-label="查过的地方"
      @update:model-value="value => editor.search(id, value ?? '')"
    />
  </FormField>
</template>
