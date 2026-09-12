<script setup lang="ts">
  import { FileUp, Flag } from '@lucide/vue'

  defineOptions({ name: 'LightNovelVolumeEpubActions' })
  defineProps<{ volumeId: number; available: boolean }>()

  const open = ref(false)
</script>

<template>
  <AuthGateButton
    v-if="available"
    label="报告 EPUB 问题"
    side="bottom"
    variant="outline"
    @click="open = true"
  >
    <Flag aria-hidden="true" />
  </AuthGateButton>
  <AuthGateButton v-else label="补充 EPUB" side="bottom" variant="outline" @click="open = true">
    <FileUp aria-hidden="true" />
  </AuthGateButton>

  <LightNovelVolumeEpubFeedbackDialog
    v-if="available"
    v-model:visible="open"
    :volume-id="volumeId"
  />
  <LightNovelVolumeEpubContributeDialog v-else v-model:visible="open" :volume-id="volumeId" />
</template>
