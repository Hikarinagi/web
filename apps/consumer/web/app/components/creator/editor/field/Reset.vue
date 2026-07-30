<script setup lang="ts">
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
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <Button
      v-if="visible"
      v-tooltip.top="'还原此字段'"
      unstyled
      aria-label="还原此字段"
      class="ml-1 inline-flex size-5 items-center justify-center rounded text-muted-color transition-colors hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800"
      @click="reset"
    >
      <template #icon>
        <RotateCcw :size="12" />
      </template>
    </Button>
  </Transition>
</template>
