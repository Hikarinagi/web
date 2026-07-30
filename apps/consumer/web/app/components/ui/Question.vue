<script setup lang="ts">
  import { CircleQuestionMark } from '@lucide/vue'
  import type { PropType } from 'vue'

  defineOptions({ name: 'UiQuestion' })

  const props = defineProps({
    title: {
      type: String,
      default: '说明',
    },
    ariaLabel: {
      type: String,
      default: '查看说明',
    },
    tooltip: {
      type: null as unknown as PropType<string | false | null | undefined>,
      default: undefined,
      validator: (value: unknown) =>
        typeof value === 'string' || value === false || value === null || value === undefined,
    },
    maxWidth: {
      type: String,
      default: '360px',
    },
    showDialog: {
      type: Boolean,
      default: true,
    },
  })

  const visible = ref(false)
  const tooltip = computed(() => {
    if (props.tooltip === false || props.tooltip === null) return { value: '', disabled: true }
    const value = props.tooltip ?? props.title
    return { value, disabled: !value }
  })

  const handleClick = () => {
    if (props.showDialog) visible.value = true
  }
</script>

<template>
  <Button
    v-tooltip.top="tooltip"
    unstyled
    class="inline-grid size-5 shrink-0 place-items-center rounded-full text-muted-color transition-colors duration-150 hover:bg-emphasis hover:text-color focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:bg-primary/10 active:text-primary"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <CircleQuestionMark class="size-3.5" aria-hidden="true" />
  </Button>

  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :header="title"
    :style="{ width: '92vw', maxWidth }"
  >
    <div class="text-sm leading-6 text-muted-color">
      <slot />
    </div>
  </Dialog>
</template>
