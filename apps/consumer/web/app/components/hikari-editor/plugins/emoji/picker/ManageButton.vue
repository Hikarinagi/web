<script setup lang="ts">
  import { Settings2 } from '@lucide/vue'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerManageButton' })

  const store = useEmojiManageStore()
</script>

<template>
  <Button
    v-tooltip.bottom="'管理贴纸包'"
    unstyled
    type="button"
    class="flex h-9 w-9 shrink-0 items-center justify-center rounded text-muted-color hover:bg-surface-100 hover:text-surface-900 dark:hover:bg-surface-800 dark:hover:text-surface-0"
    aria-label="管理贴纸包"
    login-required
    @click="store.show()"
  >
    <Settings2 :size="16" />
  </Button>
</template>
