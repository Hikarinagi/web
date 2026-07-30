<script setup lang="ts">
  import type { ReferenceField } from '~/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceSchemaFields' })
  defineProps<{ fields: ReferenceField[] }>()
</script>

<template>
  <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
    <div v-for="field in fields" :key="field.name" class="flex flex-col py-2">
      <div class="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
        <span class="font-mono text-sm text-color">
          {{ field.name }}<span v-if="field.required" class="text-red-500">*</span>
        </span>
        <span class="font-mono text-xs break-words text-muted-color">{{ field.type }}</span>
        <span class="text-sm text-muted-color">{{ field.description }}</span>
      </div>
      <div
        v-if="field.children?.length"
        class="mt-2 border-l-2 border-surface-200 pl-4 dark:border-surface-800"
      >
        <DeveloperReferenceSchemaFields :fields="field.children" />
      </div>
    </div>
  </div>
</template>
