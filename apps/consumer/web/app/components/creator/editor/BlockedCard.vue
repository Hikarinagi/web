<script setup lang="ts">
  import { CircleDotDashed } from '@lucide/vue'

  defineProps<{ changeRequestId: number }>()
</script>

<template>
  <div class="flex flex-col items-center gap-3 py-8 text-center">
    <p class="text-sm text-surface-700 dark:text-surface-200">
      此条目已有一个进行中的变更请求，合并或关闭后才能再次编辑。
    </p>
    <Button
      as="router-link"
      :to="`/create/contributions/${changeRequestId}`"
      variant="text"
      size="small"
      label="查看进行中的变更请求"
    >
      <template #icon>
        <CircleDotDashed />
      </template>
    </Button>
  </div>
</template>
