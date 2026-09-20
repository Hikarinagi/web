<script setup lang="ts">
  defineProps<{ title: string; count?: number }>()
</script>

<template>
  <section
    class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex items-center gap-2 px-4 pt-3.5 pb-3">
      <h2 class="font-bold text-color">{{ title }}</h2>
      <span v-if="count !== undefined" class="ml-auto text-[13px] text-muted-color">
        {{ count }}
      </span>
    </div>
    <slot />
  </section>
</template>
