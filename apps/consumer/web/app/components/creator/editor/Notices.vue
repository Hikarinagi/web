<script setup lang="ts">
  import { Alert } from '@hina-ui/vue'

  defineProps<{
    isContinue: boolean
    sourcesMatch: boolean | null
  }>()
</script>

<template>
  <Alert :open="isContinue" tone="warning">
    你正在续编自己进行中的变更请求，提交后将更新该请求
  </Alert>

  <Alert :open="sourcesMatch === false" tone="warning">
    Bangumi 与 VNDB 选中的条目可能不是同一作品，合并后的数据请仔细核对后再提交。
  </Alert>
</template>
