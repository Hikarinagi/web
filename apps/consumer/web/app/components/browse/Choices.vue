<script setup lang="ts">
  import { Chip, Inline } from '@hina-ui/vue'

  defineOptions({ name: 'BrowseChoices' })
  const props = defineProps<{ options: { value: string; label: string }[]; single?: boolean }>()
  const model = defineModel<string[]>({ required: true })

  function toggle(value: string, on: boolean) {
    if (props.single) model.value = on ? [value] : []
    else model.value = on ? [...model.value, value] : model.value.filter(item => item !== value)
  }
</script>

<template>
  <Inline gap="sm">
    <Chip
      v-for="option in options"
      :key="option.value"
      selectable
      :selected="model.includes(option.value)"
      @update:selected="on => toggle(option.value, on)"
    >
      {{ option.label }}
    </Chip>
  </Inline>
</template>
