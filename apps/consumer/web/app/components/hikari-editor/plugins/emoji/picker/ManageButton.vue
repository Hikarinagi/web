<script setup lang="ts">
  import { Settings2 } from '@lucide/vue'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerManageButton' })

  const store = useEmojiManageStore()
</script>

<template>
  <IconButton
    login-required
    label="管理贴纸包"
    side="bottom"
    class="shrink-0"
    @click="store.show()"
  >
    <Settings2 />
  </IconButton>
</template>
