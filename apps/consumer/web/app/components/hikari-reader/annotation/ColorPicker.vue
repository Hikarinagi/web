<script setup lang="ts">
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
  <div class="reader-color-picker flex items-center gap-1.5" role="group" aria-label="标注颜色">
    <Button
      v-for="color in ANNOTATION_COLORS"
      :key="color.value"
      unstyled
      type="button"
      class="reader-color-swatch flex items-center justify-center rounded-full border-2"
      :data-size="size"
      :style="{
        backgroundColor: color.swatch,
        borderColor: isActive(color.value) ? 'currentColor' : 'transparent',
      }"
      :aria-label="color.label"
      :aria-pressed="isActive(color.value)"
      @click="emit('update:modelValue', color.value)"
    >
      <Check
        v-if="isActive(color.value)"
        :size="size === 'sm' ? 14 : 15"
        class="text-black/70"
        aria-hidden="true"
      />
    </Button>
  </div>
</template>

<style scoped>
  .reader-color-swatch {
    transition:
      transform 140ms ease,
      box-shadow 140ms ease;
  }

  .reader-color-swatch[data-size='sm'] {
    height: 1.5rem;
    width: 1.5rem;
  }

  .reader-color-swatch[data-size='md'] {
    height: 1.75rem;
    width: 1.75rem;
  }

  .reader-color-swatch:hover {
    transform: scale(1.1);
  }

  .reader-color-swatch:focus-visible {
    box-shadow: 0 0 0 2px var(--p-primary-color);
    outline: none;
  }
</style>
