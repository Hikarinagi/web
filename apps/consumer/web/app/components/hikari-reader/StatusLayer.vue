<script setup lang="ts">
  import { Alert, Card, Heading, Inline, Progress, Stack, Text } from '@hina-ui/vue'
  import { Flag, RotateCcw } from '@lucide/vue'
  import { motion, AnimatePresence } from 'motion-v'
  import type { ReaderRuntimeError } from './lib/events'
  import type { ReaderDownloadProgress, ReaderLoadPhase } from './lib/session'
  import HikariReaderLogo from '~/assets/images/hikari-reader.webp'

  const props = defineProps<{
    loaded: boolean
    loading: boolean
    error: string | null
    runtimeError: ReaderRuntimeError | null
    phase: ReaderLoadPhase | null
    download: ReaderDownloadProgress | null
    onlineReadingAvailable: boolean
  }>()

  const emit = defineEmits<{
    retry: []
    report: []
    dismiss: []
  }>()

  const PHASE_LABELS: Record<ReaderLoadPhase, string> = {
    session: '正在申请读取授权',
    download: '正在下载 EPUB',
    parse: '正在解析与排版',
    restore: '正在同步阅读进度',
  }

  const PHASE_HINTS: Record<ReaderLoadPhase, string> = {
    session: '正在向服务器确认这本书的读取权限',
    download: '正在获取文件',
    parse: '首次打开较大的分卷需要一些时间',
    restore: '正在回到上次读到的位置',
  }

  const visible = computed(
    () => props.loading || props.error || !props.onlineReadingAvailable || !props.loaded,
  )

  const title = computed(() => {
    if (props.loading) return '正在打开 EPUB'
    if (props.error) return '阅读器加载失败'
    if (!props.onlineReadingAvailable) return '暂无 EPUB'
    return '准备就绪'
  })

  function formatBytes(value: number) {
    const mb = value / 1024 / 1024
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(value / 1024)} KB`
  }

  const description = computed(() => {
    if (props.loading) {
      const download = props.download
      if (props.phase === 'download' && download) {
        if (download.total)
          return `${formatBytes(download.loaded)} / ${formatBytes(download.total)}`
        return `已下载 ${formatBytes(download.loaded)}`
      }
      return props.phase ? PHASE_HINTS[props.phase] : '正在初始化'
    }
    if (props.error) return props.error
    if (!props.onlineReadingAvailable) return '当前分卷还没有可在线阅读的 EPUB 文件'
    return '阅读器初始化完成'
  })

  const showActions = computed(
    () => Boolean(props.error) || (props.onlineReadingAvailable && !props.loading),
  )

  const phaseLabel = computed(() => (props.phase ? PHASE_LABELS[props.phase] : '正在初始化'))

  const phaseValue = computed(() => {
    const download = props.download
    if (props.phase !== 'download' || !download?.total) return null
    return Math.round((download.loaded / download.total) * 100)
  })

  const notice = shallowRef<ReaderRuntimeError | null>(null)
  watch(
    () => props.runtimeError,
    value => {
      if (value) notice.value = value
    },
    { immediate: true },
  )
</script>

<template>
  <AnimatePresence>
    <motion.div
      v-if="visible"
      key="reader-status"
      class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6"
      :initial="{ opacity: 0, scale: 0.98 }"
      :animate="{ opacity: 1, scale: 1 }"
      :exit="{ opacity: 0, scale: 0.98 }"
    >
      <Card class="pointer-events-auto w-full max-w-sm">
        <Stack gap="lg" align="center" class="text-center">
          <HikariImage
            :src="HikariReaderLogo"
            :skeleton="false"
            class="aspect-2061/270 h-3.5 w-auto select-none [-webkit-user-drag:none]"
            image-class="size-full object-contain"
            :preload="{ fetchPriority: 'high' }"
            :draggable="false"
          />

          <Stack gap="sm" align="center">
            <Heading :level="2" size="lg">{{ title }}</Heading>
            <Text size="sm" tone="muted" class="leading-relaxed">{{ description }}</Text>
          </Stack>

          <Progress
            v-if="loading"
            :value="phaseValue"
            :label="phaseLabel"
            show-value
            class="w-full"
          />

          <Inline v-if="showActions" gap="sm" justify="center">
            <Button v-if="onlineReadingAvailable && !loading" @click="emit('retry')">
              <template #icon><RotateCcw /></template>
              {{ error ? '重新加载' : '开始阅读' }}
            </Button>
            <Button
              login-required
              v-if="error"
              variant="ghost"
              tone="neutral"
              @click="emit('report')"
            >
              <template #icon><Flag /></template>
              报告问题
            </Button>
          </Inline>

          <Button
            as="a"
            href="https://github.com/Ringyuki/Rito"
            target="_blank"
            size="sm"
            variant="ghost"
            tone="neutral"
          >
            <template #icon><Icon name="simple-icons:github" class="size-4" /></template>
            由 Rito 驱动
          </Button>
        </Stack>
      </Card>
    </motion.div>
  </AnimatePresence>

  <Inline justify="center" class="pointer-events-none absolute inset-x-0 top-0 z-40 p-4 pt-20">
    <Alert
      :open="!!runtimeError"
      tone="danger"
      closable
      title="阅读器出现了一次内部错误"
      class="pointer-events-auto w-full max-w-xl"
      @close="emit('dismiss')"
    >
      {{ notice?.message }}
      <template #actions>
        <Button login-required size="sm" variant="ghost" tone="neutral" @click="emit('report')">
          <template #icon><Flag /></template>
          报告问题
        </Button>
      </template>
    </Alert>
  </Inline>
</template>
