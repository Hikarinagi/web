<script setup lang="ts">
  import { Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'LightNovelVolumeHeroProgress' })
  const props = defineProps<{
    volumeId: number
    progress: LightNovelVolumePageData['progress']
    precedingCount: number
  }>()
  const emit = defineEmits<{ change: [NonNullable<LightNovelVolumePageData['progresses']>] }>()

  const auth = useAuthStore()

  const pct = computed(() => Math.min(100, Math.max(0, props.progress?.percentage ?? 0)))
  const finished = computed(() => props.progress?.finished ?? false)
  const marked = computed(() => Boolean(props.progress?.marked_finished_at))
  const started = computed(() => pct.value > 0 || finished.value)
  const markable = computed(() => !finished.value || marked.value)
</script>

<template>
  <Stack v-if="auth.isAuthenticated" gap="none" class="mx-auto w-full max-w-sm gap-1.5 lg:mx-0">
    <Inline
      gap="none"
      align="center"
      wrap
      class="justify-center gap-x-1.5 gap-y-0.5 lg:justify-start"
    >
      <template v-if="started">
        <Text as="span" size="xs" weight="medium" :tone="finished ? 'success' : 'default'">
          {{ finished ? '已读完' : `已读 ${Math.round(pct)}%` }}
        </Text>
        <Text v-if="marked" as="span" size="xs" tone="muted">· 手动标记</Text>
        <template v-else>
          <Text
            v-if="progress?.current_chapter_title"
            as="span"
            size="xs"
            tone="muted"
            truncate
            class="min-w-0"
          >
            · 上次读到「{{ progress.current_chapter_title }}」
          </Text>
          <Text v-if="progress" as="span" size="xs" tone="muted">
            · {{ timeFromNow(progress.last_read) }}
          </Text>
        </template>
      </template>
      <Text v-else as="span" size="xs" tone="muted">在别处读过？</Text>

      <Inline v-if="markable" as="span" gap="none" align="center" :wrap="false" class="gap-x-1.5">
        <Text v-if="started" as="span" size="xs" tone="muted">·</Text>
        <LightNovelVolumeHeroFinishMark
          :volume-id="volumeId"
          :progress="progress"
          :preceding-count="precedingCount"
          @change="emit('change', $event)"
        />
      </Inline>
    </Inline>

    <Progress
      v-if="started"
      :value="finished ? 100 : pct"
      size="sm"
      :tone="finished ? 'success' : 'accent'"
    />
  </Stack>
</template>
