<script setup lang="ts">
  import { ChevronRight } from '@lucide/vue'
  import type { ReferenceField } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DeveloperReferenceSchemaFields' })
  defineProps<{ fields: ReferenceField[] }>()

  const expanded = ref(new Set<string>())

  function toggle(name: string) {
    const next = new Set(expanded.value)
    if (next.has(name)) next.delete(name)
    else next.add(name)
    expanded.value = next
  }
</script>

<template>
  <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
    <div v-for="field in fields" :key="field.name" class="flex flex-col py-2">
      <div class="grid grid-cols-1 gap-1 sm:grid-cols-3 sm:gap-3">
        <span class="flex items-center gap-1 font-mono text-sm text-color">
          <Button
            v-if="field.children?.length"
            unstyled
            class="-ml-1 inline-flex items-center justify-center rounded p-0.5 text-muted-color transition-colors hover:text-color"
            :aria-expanded="expanded.has(field.name)"
            :aria-label="expanded.has(field.name) ? `收起 ${field.name}` : `展开 ${field.name}`"
            @click="toggle(field.name)"
          >
            <ChevronRight
              class="size-3.5 transition-transform"
              :class="expanded.has(field.name) ? 'rotate-90' : ''"
            />
          </Button>
          <span>
            {{ field.name }}
            <span v-if="field.required" class="text-red-500">*</span>
          </span>
        </span>
        <span class="font-mono text-xs break-words text-muted-color">{{ field.type }}</span>
        <span class="text-sm text-muted-color">{{ field.description }}</span>
      </div>
      <dl
        v-if="field.enumValues?.length"
        class="sm:ml-1/3 mt-1.5 flex flex-col gap-1 rounded px-3 py-2 bg-emphasis"
      >
        <div v-for="item in field.enumValues" :key="item.value" class="flex gap-3">
          <dt class="w-44 shrink-0 font-mono text-xs text-color">{{ item.value }}</dt>
          <dd class="text-xs text-muted-color">{{ item.label }}</dd>
        </div>
      </dl>
      <div
        v-if="field.children?.length && expanded.has(field.name)"
        class="mt-2 border-l-2 border-surface-200 pl-4 dark:border-surface-800"
      >
        <DeveloperReferenceSchemaFields :fields="field.children" />
      </div>
    </div>
  </div>
</template>
