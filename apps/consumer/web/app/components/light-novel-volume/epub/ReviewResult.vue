<script setup lang="ts">
  import type { EpubReview, EpubReviewStatus } from '~/features/light-novel-volume/epub-correction'

  defineOptions({ name: 'LightNovelVolumeEpubReviewResult' })
  const props = defineProps<{
    review: EpubReview | null
    isTerminal: boolean
    status: EpubReviewStatus | null
    mode: 'fix' | 'fill'
  }>()

  const pendingHint = computed(() =>
    props.mode === 'fix'
      ? '报告已提交。可关闭窗口,校验通过后会自动替换。'
      : '可关闭窗口,校验通过后会自动添加。',
  )
  const passed = computed(() =>
    props.mode === 'fix' ? '校验通过,已替换为你上传的版本,感谢你的贡献!' : '校验通过,感谢你的贡献!',
  )
  const needsHuman = computed(() =>
    props.mode === 'fix'
      ? '文件已转交人工复核,通过后会自动替换;你的报告也已记录,无需再次提交。'
      : '文件已转交人工复核,通过后会自动添加,无需再次提交。',
  )
  const rejected = computed(() =>
    props.mode === 'fix'
      ? '你上传的文件未通过校验,当前文件未替换;不过你的报告已记录。'
      : '未通过校验,未能添加。',
  )
  const failed = computed(() =>
    props.mode === 'fix' ? '校验失败,请稍后重试;你的报告已记录。' : '校验失败,请稍后重试。',
  )
</script>

<template>
  <div class="flex flex-col gap-4">
    <div v-if="!isTerminal" class="flex flex-col items-center gap-3 py-6 text-center">
      <Spinner :size="40" />
      <p class="text-sm font-medium text-color">正在自动校验你上传的文件…</p>
      <p class="text-xs text-muted-color">{{ pendingHint }}</p>
    </div>

    <template v-else>
      <Message v-if="status === 'PASSED'" severity="success" :closable="false">
        {{ passed }}
      </Message>
      <Message v-else-if="status === 'NEEDS_HUMAN'" severity="info" :closable="false">
        {{ needsHuman }}
      </Message>
      <Message v-else-if="status === 'REJECTED'" severity="warn" :closable="false">
        {{ rejected }}
      </Message>
      <Message v-else severity="error" :closable="false">{{ failed }}</Message>

      <ul
        v-if="review?.reasons?.length && status !== 'PASSED'"
        class="flex flex-col gap-1.5 text-sm text-muted-color"
      >
        <li v-for="(reason, index) in review?.reasons ?? []" :key="index" class="flex gap-2">
          <span aria-hidden="true">·</span>
          <span>{{ reason }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>
