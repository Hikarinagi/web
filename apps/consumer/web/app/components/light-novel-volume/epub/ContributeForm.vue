<script setup lang="ts">
  import { FileUpload, ScrollArea } from '@hina-ui/vue'
  import { useEpubFeedback } from '~/features/light-novel-volume/useEpubFeedback'

  defineOptions({ name: 'LightNovelVolumeEpubContributeForm' })
  const props = defineProps<{ volumeId: number }>()

  const { file, submitting, review, status, isTerminal, contribute, reset, pause } =
    useEpubFeedback(props.volumeId)

  defineExpose({ file, submitting, review, status, isTerminal, contribute, reset, pause })
</script>

<template>
  <FileUpload v-if="!review" v-model="file" accept=".epub,application/epub+zip">
    选择或拖入 EPUB 文件
  </FileUpload>
  <ScrollArea v-else>
    <LightNovelVolumeEpubReviewResult
      :review="review"
      :is-terminal="isTerminal"
      :status="status"
      mode="fill"
    />
  </ScrollArea>
</template>
