<script setup lang="ts">
  defineOptions({ name: 'ChangelogDialog' })

  const visible = defineModel<boolean>('visible', { default: false })
  const opened = ref(false)

  watch(visible, value => {
    if (value) opened.value = true
  })
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    header="更新日志"
    class="mx-4 w-full max-w-lg"
  >
    <ChangelogList v-if="opened" />
  </Dialog>
</template>
