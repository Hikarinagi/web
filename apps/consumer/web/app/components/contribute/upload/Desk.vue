<script setup lang="ts">
  import { Card } from '@hina-ui/vue'

  defineProps<{ dragging?: boolean }>()
  const emit = defineEmits<{ active: [value: boolean] }>()

  const card = useTemplateRef<{ $el: HTMLElement }>('card')
  const element = computed(() => card.value?.$el)
  const hovered = useElementHover(element)
  const { focused } = useFocusWithin(element)

  watchEffect(() => emit('active', hovered.value || focused.value))
  onBeforeUnmount(() => emit('active', false))
</script>

<template>
  <Card
    ref="card"
    class="transition-colors duration-(--hn-duration-base) ease-(--hn-ease-move) data-dragging:border-accent data-dragging:bg-accent-soft"
    :data-dragging="dragging || undefined"
  >
    <slot />
  </Card>
</template>
