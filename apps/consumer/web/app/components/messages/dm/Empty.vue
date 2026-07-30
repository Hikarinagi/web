<script setup lang="ts">
  import { MessagesSquare } from '@lucide/vue'

  defineOptions({ name: 'MessagesDmEmpty' })
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
    <MessagesSquare class="size-8 text-surface-300 dark:text-surface-600" />
    <p class="text-sm text-muted-color">选择一个对话开始聊天</p>
  </div>
</template>
