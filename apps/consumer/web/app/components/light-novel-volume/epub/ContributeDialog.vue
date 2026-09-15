<script setup lang="ts">
  import { Button, Dialog, FileUpload, Stack, Text } from '@hina-ui/vue'
  import { useEpubFeedback } from '~/features/light-novel-volume/useEpubFeedback'

  defineOptions({ name: 'LightNovelVolumeEpubContributeDialog' })
  const props = defineProps<{ volumeId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { file, submitting, review, status, isTerminal, contribute, reset, pause } =
    useEpubFeedback(props.volumeId)

  watch(visible, next => {
    if (next) {
      reset()
      return
    }
    if (status.value === 'PASSED') void refreshNuxtData()
    pause()
  })

  function close() {
    if (submitting.value) return
    visible.value = false
  }
</script>

<template>
  <Dialog v-model:open="visible" title="补充 EPUB" size="lg" :locked="submitting">
    <template #content>
      <Stack v-if="!review" gap="md">
        <Text size="sm" tone="muted">
          这一卷还没有人贡献 EPUB！你可以在此上传此卷的本地化 EPUB 文件，简中和繁中均可
        </Text>

        <FileUpload v-model="file" accept=".epub,application/epub+zip">
          选择或拖入 EPUB 文件
        </FileUpload>
      </Stack>

      <LightNovelVolumeEpubReviewResult
        v-else
        :review="review"
        :is-terminal="isTerminal"
        :status="status"
        mode="fill"
      />
    </template>

    <template v-if="!review || isTerminal" #footer>
      <template v-if="!review">
        <Button variant="ghost" tone="neutral" :disabled="submitting" @click="close">取消</Button>
        <Button :disabled="!file" :loading="submitting" @click="contribute">上传</Button>
      </template>
      <template v-else>
        <Button
          v-if="status === 'REJECTED' || status === 'FAILED'"
          variant="outline"
          tone="neutral"
          @click="reset"
        >
          重新上传
        </Button>
        <Button @click="visible = false">完成</Button>
      </template>
    </template>
  </Dialog>
</template>
