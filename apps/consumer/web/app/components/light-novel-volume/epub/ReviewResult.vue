<script setup lang="ts">
  import { Alert, List, ListItem, Spinner, Stack, Text } from '@hina-ui/vue'
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
      ? '报告已提交。可关闭窗口，校验通过后会自动替换。'
      : '可关闭窗口，校验通过后会自动添加。',
  )
  const passed = computed(() =>
    props.mode === 'fix'
      ? '校验通过，已替换为你上传的版本，感谢你的贡献！'
      : '校验通过，感谢你的贡献！',
  )
  const needsHuman = computed(() =>
    props.mode === 'fix'
      ? '文件已转交人工复核，通过后会自动替换；你的报告也已记录，无需再次提交。'
      : '文件已转交人工复核，通过后会自动添加，无需再次提交。',
  )
  const rejected = computed(() =>
    props.mode === 'fix'
      ? '你上传的文件未通过校验，当前文件未替换；不过你的报告已记录。'
      : '未通过校验，未能添加。',
  )
  const failed = computed(() =>
    props.mode === 'fix' ? '校验失败，请稍后重试；你的报告已记录。' : '校验失败，请稍后重试。',
  )

  const result = computed(() => {
    switch (props.status) {
      case 'PASSED':
        return { tone: 'success' as const, text: passed.value }
      case 'NEEDS_HUMAN':
        return { tone: 'info' as const, text: needsHuman.value }
      case 'REJECTED':
        return { tone: 'warning' as const, text: rejected.value }
      default:
        return { tone: 'danger' as const, text: failed.value }
    }
  })
</script>

<template>
  <Stack gap="md">
    <Stack v-if="!isTerminal" gap="sm" align="center" class="py-6 text-center">
      <Spinner size="lg" />
      <Text size="sm" weight="medium">正在自动校验你上传的文件…</Text>
      <Text size="xs" tone="muted">{{ pendingHint }}</Text>
    </Stack>

    <Alert :open="isTerminal" :tone="result.tone">{{ result.text }}</Alert>

    <List v-if="isTerminal && review?.reasons?.length && status !== 'PASSED'">
      <ListItem v-for="(reason, index) in review?.reasons ?? []" :key="index">
        <Text as="span" size="sm" tone="muted">{{ reason }}</Text>
      </ListItem>
    </List>
  </Stack>
</template>
