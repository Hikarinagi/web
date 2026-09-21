<script setup lang="ts">
  import { Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'LightNovelVolumeHeroProgress' })
  const props = defineProps<{ progress: LightNovelVolumePageData['progress'] }>()

  const pct = computed(() => Math.min(100, Math.max(0, props.progress?.percentage ?? 0)))
  const done = computed(() => pct.value >= 99)
</script>

<template>
  <Stack v-if="progress && pct > 0" gap="none" class="mx-auto max-w-sm gap-1.5 lg:mx-0">
    <Inline gap="none" align="center" wrap class="gap-x-1.5 gap-y-0.5">
      <Text as="span" size="xs" weight="medium" :tone="done ? 'success' : 'default'">
        {{ done ? '已读完' : `已读 ${Math.round(pct)}%` }}
      </Text>
      <Text
        v-if="progress.current_chapter_title"
        as="span"
        size="xs"
        tone="muted"
        truncate
        class="min-w-0"
      >
        · 上次读到「{{ progress.current_chapter_title }}」
      </Text>
      <Text as="span" size="xs" tone="muted">· {{ timeFromNow(progress.last_read) }}</Text>
    </Inline>

    <Progress :value="pct" size="sm" :tone="done ? 'success' : 'accent'" />
  </Stack>
</template>
