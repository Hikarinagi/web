<script setup lang="ts">
  import { Check } from '@lucide/vue'

  defineOptions({ name: 'HikariContentNodesPollOption' })

  defineProps<{
    label: string
    percent: number | null
    selected: boolean
    resultsVisible: boolean
    disabled: boolean
    loginRequired: boolean
  }>()

  const emit = defineEmits<{ pick: [] }>()
</script>

<template>
  <Button
    unstyled
    type="button"
    :disabled="disabled"
    :login-required="loginRequired"
    class="relative flex w-full items-center overflow-hidden rounded-lg border px-3 py-2.5 text-left transition-colors"
    :class="[
      selected ? 'border-primary' : 'border-surface',
      disabled ? 'cursor-default' : 'cursor-pointer hover:border-primary/60',
    ]"
    @click="emit('pick')"
  >
    <div
      v-if="resultsVisible && percent !== null"
      class="absolute inset-y-0 left-0 transition-[width] duration-300 ease-out"
      :class="selected ? 'bg-primary/15' : 'bg-emphasis'"
      :style="{ width: `${percent}%` }"
      aria-hidden="true"
    />
    <span class="relative z-1 flex min-w-0 flex-1 items-center gap-2">
      <Check v-if="selected" class="size-4 shrink-0 text-primary" />
      <span class="truncate text-sm text-color" :class="{ 'font-medium': selected }">
        {{ label }}
      </span>
    </span>
    <span
      v-if="resultsVisible && percent !== null"
      class="relative z-1 ml-3 shrink-0 text-xs text-muted-color tabular-nums"
    >
      {{ percent }}%
    </span>
  </Button>
</template>
