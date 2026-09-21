<script setup lang="ts">
  import { Card, Inline, Text } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'HikariContentNodesPollOption' })

  const props = defineProps<{
    label: string
    percent: number | null
    selected: boolean
    resultsVisible: boolean
    disabled: boolean
    loginRequired: boolean
  }>()

  const emit = defineEmits<{ pick: [] }>()

  const { requireLogin } = useAuthGate()

  function onPick() {
    if (props.disabled) return
    if (props.loginRequired && !requireLogin()) return
    emit('pick')
  }
</script>

<template>
  <Card
    as="button"
    type="button"
    :padded="false"
    :disabled="disabled"
    class="hn-state-layer relative flex w-full hn-interactive items-center overflow-hidden px-3 py-2.5 text-left hn-press-none"
    :class="
      cn(selected ? 'border-accent' : 'border-line', disabled ? 'cursor-default' : 'cursor-pointer')
    "
    @click="onPick"
  >
    <Inline
      v-if="resultsVisible && percent !== null"
      gap="none"
      aria-hidden="true"
      class="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
      :class="selected ? 'bg-accent-soft' : 'bg-subtle'"
      :style="{ width: `${percent}%` }"
    />
    <Inline gap="sm" align="center" :wrap="false" class="relative z-1 min-w-0 flex-1">
      <Check v-if="selected" class="size-4 shrink-0 text-accent-text" />
      <Text as="span" size="sm" truncate :weight="selected ? 'medium' : 'normal'">
        {{ label }}
      </Text>
    </Inline>
    <Text
      v-if="resultsVisible && percent !== null"
      as="span"
      size="xs"
      tone="muted"
      class="relative z-1 ml-3 shrink-0 tabular-nums"
    >
      {{ percent }}%
    </Text>
  </Card>
</template>
