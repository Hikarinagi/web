<script setup lang="ts">
  defineOptions({ name: 'HikariEditorPluginsEmojiPickerSection' })

  defineProps<{
    id: string
    title: string
  }>()
</script>

<template>
  <section :data-section-id="id" class="flex flex-col">
    <h3
      class="sticky top-0 z-10 bg-surface-0/95 px-2 py-1.5 text-xs font-medium text-muted-color backdrop-blur dark:bg-surface-900/95"
    >
      {{ title }}
    </h3>
    <slot />
  </section>
</template>
