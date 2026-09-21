<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { RotateCcw } from '@lucide/vue'

  const props = defineProps<{ initial: unknown }>()
  const model = defineModel<unknown>()

  const visible = computed(
    () => JSON.stringify(model.value ?? null) !== JSON.stringify(props.initial ?? null),
  )

  function reset() {
    model.value = props.initial == null ? null : structuredClone(toRaw(props.initial))
  }
</script>

<template>
  <Transition
    enter-active-class="hn-transition"
    leave-active-class="hn-transition"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <IconButton
      v-if="visible"
      v-tooltip="'还原此字段'"
      data-density="compact"
      label="还原此字段"
      variant="ghost"
      tone="neutral"
      size="sm"
      class="order-1"
      @click="reset"
    >
      <RotateCcw />
    </IconButton>
  </Transition>
</template>
