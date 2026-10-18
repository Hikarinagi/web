<script setup lang="ts">
  import { Inline, Slider, Text } from '@hina-ui/vue'

  defineOptions({ name: 'MangaReaderProgressScrubber' })

  const props = defineProps<{
    total: number
    filled: number
    step: number
  }>()

  const emit = defineEmits<{ jump: [page: number] }>()

  const draft = ref<number | null>(null)

  const value = computed(() => draft.value ?? props.filled)
  const label = computed(() => `${value.value} / ${props.total}`)

  function commit() {
    const target = value.value
    draft.value = null
    if (target !== props.filled) emit('jump', target)
  }
</script>

<template>
  <Inline :wrap="false">
    <Slider
      dir="rtl"
      :model-value="value"
      :min="1"
      :max="total"
      :step="step"
      size="sm"
      class="flex-1"
      :aria-label="`阅读进度，第 ${value} 页，共 ${total} 页`"
      @update:model-value="next => (draft = next ?? null)"
      @commit="commit"
    />
    <Text size="xs" class="w-16 shrink-0 text-right text-neutral-300 tabular-nums">
      {{ label }}
    </Text>
  </Inline>
</template>
