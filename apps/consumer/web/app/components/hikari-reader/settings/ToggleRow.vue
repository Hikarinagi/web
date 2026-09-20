<script setup lang="ts">
  defineOptions({ name: 'HikariReaderSettingsToggleRow' })

  defineProps<{ label: string; description?: string }>()

  const modelValue = defineModel<boolean>({ required: true })
  const id = useId()
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="space-y-0.5">
      <label :for="id" class="block text-sm">{{ label }}</label>
      <p v-if="description" class="text-xs text-muted-color">{{ description }}</p>
    </div>
    <ToggleSwitch v-model="modelValue" :input-id="id" />
  </div>
</template>
