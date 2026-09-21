<script setup lang="ts">
  import { Empty } from '@hina-ui/vue'
  import { Clock } from '@lucide/vue'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerRecentEmpty' })
</script>

<template>
  <Empty size="sm" title="什么都没有" class="px-3 py-6">
    <template #icon><Clock /></template>
  </Empty>
</template>
