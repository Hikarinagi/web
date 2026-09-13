<script setup lang="ts">
  import { useEpubFeedback } from '~/features/light-novel-volume/useEpubFeedback'

  defineOptions({ name: 'LightNovelVolumeEpubContributeDialog' })
  const props = defineProps<{ volumeId: number }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const { file, pickFile, submitting, review, status, isTerminal, contribute, reset, pause } =
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
  <Dialog
    v-model:visible="visible"
    modal
    header="补充 EPUB"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '32rem' }"
  >
    <div v-if="!review" class="flex flex-col gap-4">
      <p class="text-sm leading-relaxed text-muted-color">
        这一卷还没有人贡献EPUB！你可以在此上传此卷的汉化EPUB文件，简中和繁中均可
      </p>

      <LightNovelVolumeEpubUploadZone :file="file" @pick="pickFile" />

      <div class="flex justify-end gap-3 pt-1">
        <Button label="取消" severity="secondary" text :disabled="submitting" @click="close" />
        <Button label="上传" :disabled="!file" :loading="submitting" @click="contribute" />
      </div>
    </div>

    <div v-else class="flex flex-col gap-4">
      <LightNovelVolumeEpubReviewResult
        :review="review"
        :is-terminal="isTerminal"
        :status="status"
        mode="fill"
      />
      <div v-if="isTerminal" class="flex justify-end gap-3 pt-1">
        <Button
          v-if="status === 'REJECTED' || status === 'FAILED'"
          label="重新上传"
          severity="secondary"
          outlined
          @click="reset"
        />
        <Button label="完成" @click="visible = false" />
      </div>
    </div>
  </Dialog>
</template>
