<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { Download, Link2 } from '@lucide/vue'

  defineOptions({ name: 'GalgameDownloadsGameFileActions' })
  defineProps<{ loading: boolean }>()
  defineEmits<{ download: []; copy: [] }>()
</script>

<template>
  <Inline gap="sm" :wrap="false">
    <Button login-required size="sm" :loading="loading" @click="$emit('download')">
      <template #icon><Download /></template>
      下载
    </Button>
    <IconButton
      login-required
      label="复制下载链接"
      size="sm"
      variant="outline"
      tone="neutral"
      :loading="loading"
      @click="$emit('copy')"
    >
      <Link2 />
    </IconButton>
  </Inline>
</template>
