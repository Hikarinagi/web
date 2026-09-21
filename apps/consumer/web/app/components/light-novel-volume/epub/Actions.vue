<script setup lang="ts">
  import { FileUp, Flag } from '@lucide/vue'

  defineOptions({ name: 'LightNovelVolumeEpubActions' })
  defineProps<{ volumeId: number; available: boolean; size?: 'sm' | 'md' | 'lg' }>()

  const open = ref(false)
</script>

<template>
  <IconButton
    login-required
    v-if="available"
    label="报告 EPUB 问题"
    side="bottom"
    :size="size"
    @click="open = true"
  >
    <Flag aria-hidden="true" />
  </IconButton>
  <IconButton
    login-required
    v-else
    label="补充 EPUB"
    side="bottom"
    :size="size"
    @click="open = true"
  >
    <FileUp aria-hidden="true" />
  </IconButton>

  <LightNovelVolumeEpubFeedbackDialog
    v-if="available"
    v-model:visible="open"
    :volume-id="volumeId"
  />
  <LightNovelVolumeEpubContributeDialog v-else v-model:visible="open" :volume-id="volumeId" />
</template>
