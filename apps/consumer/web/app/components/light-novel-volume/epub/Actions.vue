<script setup lang="ts">
  import { FileUp, Flag } from '@lucide/vue'

  defineOptions({ name: 'LightNovelVolumeEpubActions' })
  defineProps<{ volumeId: number; available: boolean }>()

  const open = ref(false)
</script>

<template>
  <Button
    v-if="available"
    v-tooltip.bottom="'报告问题'"
    login-required
    severity="secondary"
    outlined
    aria-label="报告 EPUB 问题"
    @click="open = true"
  >
    <template #icon>
      <Flag class="size-[1em]" aria-hidden="true" />
    </template>
  </Button>
  <Button
    v-else
    v-tooltip.bottom="'补充 EPUB'"
    login-required
    severity="secondary"
    outlined
    aria-label="补充 EPUB"
    @click="open = true"
  >
    <template #icon>
      <FileUp class="size-[1em]" aria-hidden="true" />
    </template>
  </Button>

  <LightNovelVolumeEpubFeedbackDialog
    v-if="available"
    v-model:visible="open"
    :volume-id="volumeId"
  />
  <LightNovelVolumeEpubContributeDialog v-else v-model:visible="open" :volume-id="volumeId" />
</template>
