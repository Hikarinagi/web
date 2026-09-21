<script setup lang="ts" generic="T extends string | number | boolean | null">
  import { Button, DisclosureIcon, DropdownMenu, DropdownMenuItem } from '@hina-ui/vue'
  import { Check } from '@lucide/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariFilterSelect' })

  const model = defineModel<T>()
  const props = defineProps<{
    options: { label: string; value: T }[]
    placeholder: string
    icon?: Component
  }>()

  const active = computed(() => model.value != null && model.value !== false)
  const label = computed(() =>
    active.value
      ? (props.options.find(o => o.value === model.value)?.label ?? props.placeholder)
      : props.placeholder,
  )
</script>

<template>
  <DropdownMenu :label="placeholder" align="start" class="min-w-32">
    <Button size="sm" :variant="active ? 'soft' : 'outline'" :tone="active ? 'accent' : 'neutral'">
      <template v-if="icon" #icon><component :is="icon" /></template>
      {{ label }}
      <template #trailing><DisclosureIcon /></template>
    </Button>

    <template #content>
      <DropdownMenuItem
        v-for="option in options"
        :key="String(option.value)"
        @select="model = option.value"
      >
        {{ option.label }}
        <template v-if="option.value === model" #trailing><Check /></template>
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
