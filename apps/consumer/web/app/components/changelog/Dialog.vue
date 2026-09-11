<script setup lang="ts">
  import { Dialog } from '@hina-ui/vue'

  defineOptions({ name: 'ChangelogDialog' })

  const visible = defineModel<boolean>('visible', { default: false })
</script>

<template>
  <Dialog v-model:open="visible" title="更新日志" size="lg">
    <template #content>
      <ChangelogList />
    </template>
  </Dialog>
</template>
