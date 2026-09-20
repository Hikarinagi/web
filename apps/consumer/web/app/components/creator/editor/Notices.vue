<script setup lang="ts">
  defineProps<{
    isContinue: boolean
    sourcesMatch: boolean | null
  }>()
</script>

<template>
  <Message v-if="isContinue" severity="warn" variant="simple" size="small">
    你正在续编自己进行中的变更请求，提交后将更新该请求
  </Message>

  <Message v-if="sourcesMatch === false" severity="warn" variant="simple" size="small">
    Bangumi 与 VNDB 选中的条目可能不是同一作品，合并后的数据请仔细核对后再提交。
  </Message>
</template>
