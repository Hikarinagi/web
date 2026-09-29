<script setup lang="ts">
  import { Flag } from '@lucide/vue'

  defineOptions({ name: 'LightNovelVolumeEpubActions' })
  defineProps<{ volumeId: number; available: boolean; size?: 'sm' | 'md' | 'lg' }>()

  const open = ref(false)
</script>

<template>
  <template v-if="available">
    <IconButton
      login-required
      label="报告 EPUB 问题"
      side="bottom"
      :size="size"
      @click="open = true"
    >
      <Flag aria-hidden="true" />
    </IconButton>
    <LightNovelVolumeEpubFeedbackDialog v-model:visible="open" :volume-id="volumeId" />
  </template>
</template>
