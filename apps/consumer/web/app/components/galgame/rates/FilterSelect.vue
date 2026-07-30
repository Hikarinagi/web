<script setup lang="ts" generic="T extends string | number | boolean | null">
  import { Check, ChevronDown } from '@lucide/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'GalgameRatesFilterSelect' })
  const model = defineModel<T>()
  const props = defineProps<{
    options: { label: string; value: T }[]
    placeholder: string
    icon?: Component
  }>()

  const pop = ref()
  const active = computed(() => model.value != null && model.value !== false)
  const label = computed(() =>
    active.value
      ? (props.options.find(o => o.value === model.value)?.label ?? props.placeholder)
      : props.placeholder,
  )

  function pick(value: T) {
    model.value = value
    pop.value?.hide()
  }
</script>

<template>
  <Button
    type="button"
    unstyled
    class="inline-flex items-center gap-1.5 rounded-lg border px-3 py-[7px] text-xs transition-colors"
    :class="
      active
        ? 'border-hikari-primary-500 bg-hikari-primary-50 text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
        : 'border-surface-200 bg-surface-0 text-surface-700 hover:bg-surface-50 active:bg-surface-100 dark:border-surface-700 dark:bg-surface-900 dark:text-surface-300 dark:hover:border-surface-600 dark:hover:bg-surface-800 dark:active:bg-surface-800'
    "
    @click="pop?.toggle($event)"
  >
    <component :is="icon" v-if="icon" class="size-3.5" />
    <span class="font-medium">{{ label }}</span>
    <ChevronDown class="size-3 opacity-70" />
  </Button>

  <Popover ref="pop" :pt="{ content: { class: 'p-1!' } }">
    <div class="flex min-w-32 flex-col">
      <Button
        v-for="opt in options"
        :key="String(opt.value)"
        type="button"
        unstyled
        class="flex items-center justify-between gap-3 rounded-md px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
        :class="
          opt.value === model
            ? 'font-semibold text-hikari-primary-600 dark:text-hikari-primary-400'
            : 'text-surface-700 dark:text-surface-300'
        "
        @click="pick(opt.value)"
      >
        {{ opt.label }}
        <Check v-if="opt.value === model" class="size-3.5 shrink-0" />
      </Button>
    </div>
  </Popover>
</template>
