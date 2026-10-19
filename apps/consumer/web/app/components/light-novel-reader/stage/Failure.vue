<script setup lang="ts">
  import { Button, Center, Empty } from '@hina-ui/vue'
  import { AlertCircle, FileX, MonitorX, RefreshCw, Timer, WifiOff } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'
  import type { ReaderFailure } from '~/features/light-novel-reader/useReaderEngine'

  defineOptions({ name: 'LightNovelReaderStageFailure' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { engine } = useReader()

  const COPY: Record<
    ReaderFailure,
    { title: string; description: string; retry?: string; app?: string; back?: string }
  > = {
    sessions: {
      title: '同时打开的书籍过多',
      description: '请在其他标签页或设备上关闭部分书籍，或稍后重试。',
      retry: '重试',
      back: '返回分卷详情',
    },
    quota: {
      title: '打开过于频繁',
      description: '短时间内打开的书籍已达上限，请稍后重试。',
      retry: '重试',
      back: '返回分卷详情',
    },
    changed: {
      title: '本卷文件已更新',
      description: '本卷文件已被修正。重新打开即可阅读最新版本，阅读进度、高亮和笔记均会保留。',
      retry: '重新打开',
    },
    missing: {
      title: '本卷暂无 EPUB',
      description: '本卷尚无可供阅读的 EPUB 文件，可在分卷详情页补充。',
      back: '去补充 EPUB',
    },
    withdrawn: {
      title: '已引进正式中文版',
      description: '本作品已引进正式中文版，本站不再提供翻译版阅读。',
      back: '返回分卷详情',
    },
    unavailable: {
      title: '文件暂时无法获取',
      description: '本卷文件暂时无法读取，请稍后重试。',
      retry: '重试',
      back: '返回分卷详情',
    },
    network: {
      title: '网络连接失败',
      description: '请检查网络连接后重试。',
      retry: '重试',
    },
    engine: {
      title: '无法排版本卷',
      description: '阅读器未能打开本卷文件。若重试后仍无法打开，请在分卷详情页报告问题。',
      retry: '重试',
      back: '返回分卷详情',
    },
    webgl: {
      title: '浏览器无法显示阅读器',
      description:
        '当前浏览器无法使用硬件加速。请下载 App 阅读，或在浏览器设置中开启硬件加速后重新打开本页。',
      app: '下载 App',
      back: '返回分卷详情',
    },
  }

  const ICONS = {
    sessions: Timer,
    quota: Timer,
    changed: RefreshCw,
    missing: FileX,
    withdrawn: FileX,
    unavailable: AlertCircle,
    network: WifiOff,
    engine: AlertCircle,
    webgl: MonitorX,
  } satisfies Record<ReaderFailure, unknown>

  const copy = computed(() => COPY[engine.failure.value ?? 'network'])
  const icon = computed(() => ICONS[engine.failure.value ?? 'network'])
</script>

<template>
  <Center class="absolute inset-0 bg-canvas p-4">
    <Empty :title="copy.title" :description="copy.description" class="max-w-sm">
      <template #icon><component :is="icon" aria-hidden="true" /></template>
      <template #actions>
        <Button v-if="copy.retry" size="sm" @click="engine.open()">{{ copy.retry }}</Button>
        <Button v-if="copy.app" size="sm" :as="NuxtLink" to="/app">{{ copy.app }}</Button>
        <Button
          v-if="copy.back"
          size="sm"
          :variant="copy.retry || copy.app ? 'ghost' : 'solid'"
          :tone="copy.retry || copy.app ? 'neutral' : 'accent'"
          :as="NuxtLink"
          :to="`/light-novel-volumes/${props.data.volume.id}`"
        >
          {{ copy.back }}
        </Button>
      </template>
    </Empty>
  </Center>
</template>
