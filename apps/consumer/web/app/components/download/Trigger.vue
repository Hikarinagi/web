<script setup lang="ts">
  import { Download } from '@lucide/vue'

  defineProps<{ loading: boolean }>()
  defineEmits<{ click: [] }>()
</script>

<template>
  <IconButton
    login-required
    label="下载"
    side="bottom"
    size="lg"
    :loading="loading"
    @click="$emit('click')"
  >
    <Download aria-hidden="true" />
  </IconButton>
</template>
