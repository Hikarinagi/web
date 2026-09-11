<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import { ANNOTATION_COLORS } from '../composables/useReaderAnnotations'

  defineOptions({ name: 'HikariReaderAnnotationColorPicker' })

  const props = withDefaults(
    defineProps<{
      modelValue?: string | null
      size?: 'sm' | 'md'
    }>(),
    {
      modelValue: null,
      size: 'md',
    },
  )

  const emit = defineEmits<{
    'update:modelValue': [color: string]
  }>()

  function isActive(value: string) {
    return (props.modelValue ?? '').toLowerCase() === value.toLowerCase()
  }
</script>

<template>
  <Inline gap="xs" align="center" role="group" aria-label="标注颜色">
    <Button
      v-for="color in ANNOTATION_COLORS"
      :key="color.value"
      variant="ghost"
      tone="neutral"
      icon-only
      pill
      :class="cn('border-2', size === 'sm' ? 'size-6' : 'size-7')"
      :style="{
        backgroundColor: color.swatch,
        borderColor: isActive(color.value) ? 'currentColor' : 'transparent',
      }"
      :aria-label="color.label"
      :aria-pressed="isActive(color.value)"
      @click="emit('update:modelValue', color.value)"
    >
      <template #icon>
        <Check v-if="isActive(color.value)" class="text-black/70" aria-hidden="true" />
      </template>
    </Button>
  </Inline>
</template>
