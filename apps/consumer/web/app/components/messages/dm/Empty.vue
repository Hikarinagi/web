<script setup lang="ts">
  import { Center, Empty } from '@hina-ui/vue'
  import { MessagesSquare } from '@lucide/vue'

  defineOptions({ name: 'MessagesDmEmpty' })
</script>

<template>
  <Center class="h-full px-6">
    <Empty title="选择一个对话开始聊天">
      <template #icon><MessagesSquare /></template>
    </Empty>
  </Center>
</template>
