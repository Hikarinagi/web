<script setup lang="ts">
  import { Button, Dialog, Text } from '@hina-ui/vue'
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
    size: {
      type: String as PropType<'sm' | 'md' | 'lg'>,
      default: 'sm',
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
    variant="ghost"
    tone="neutral"
    size="sm"
    icon-only
    pill
    class="size-5"
    :aria-label="ariaLabel"
    @click="handleClick"
  >
    <CircleQuestionMark />
  </Button>

  <Dialog v-model:open="visible" :title="title" :size="size">
    <template #content>
      <Text tone="muted" size="sm" class="leading-6">
        <slot />
      </Text>
    </template>
  </Dialog>
</template>
