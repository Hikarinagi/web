<script setup lang="ts">
  import { Flag, RotateCcw } from '@lucide/vue'
  import { motion, AnimatePresence } from 'motion-v'
  import { cn } from '~/utils/cn'
  import HikariReaderLogo from '~/assets/images/hikari-reader.webp'

  const props = defineProps<{
    loaded: boolean
    loading: boolean
    error: string | null
    onlineReadingAvailable: boolean
  }>()

  const emit = defineEmits<{
    retry: []
    report: []
  }>()

  const visible = computed(
    () => props.loading || props.error || !props.onlineReadingAvailable || !props.loaded,
  )
  const title = computed(() => {
    if (props.loading) return '正在打开 EPUB'
    if (props.error) return '阅读器加载失败'
    if (!props.onlineReadingAvailable) return '暂无 EPUB'
    return '准备就绪'
  })
  const description = computed(() => {
    if (props.loading) return '正在初始化排版并同步阅读进度'
    if (props.error) return props.error
    if (!props.onlineReadingAvailable) return '当前分卷还没有可在线阅读的 EPUB 文件'
    return '阅读器初始化完成'
  })
</script>

<template>
  <div class="contents">
    <AnimatePresence>
      <motion.div
        v-if="visible"
        key="reader-status"
        class="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6"
        :initial="{ opacity: 0, scale: 0.98 }"
        :animate="{ opacity: 1, scale: 1 }"
        :exit="{ opacity: 0, scale: 0.98 }"
      >
        <Card
          unstyled
          :class="
            cn(
              'pointer-events-auto w-full max-w-sm',
              'rounded-md border border-surface-200/55 bg-surface-0 p-8 shadow-[0_1px_8px_rgba(15,23,42,0.045)] dark:border-surface-800/60 dark:bg-surface-950 dark:shadow-[0_1px_8px_rgba(0,0,0,0.18)]',
            )
          "
        >
          <template #header>
            <HikariImage
              :src="HikariReaderLogo"
              :skeleton="false"
              class="mx-auto mb-4 aspect-2061/270 h-3.5 w-auto select-none [-webkit-user-drag:none]"
              image-class="size-full object-contain"
              :preload="{ fetchPriority: 'high' }"
              :draggable="false"
            />
          </template>
          <template #content>
            <div class="flex flex-col items-center gap-5 text-center">
              <Spinner v-if="loading" :size="40" label="正在加载" />
              <div class="space-y-2">
                <h2 class="text-lg font-semibold">{{ title }}</h2>
                <p class="text-sm leading-6 text-surface-400">{{ description }}</p>
              </div>

              <div class="flex flex-wrap items-center justify-center gap-2">
                <Button
                  v-if="onlineReadingAvailable && !loading"
                  :label="error ? '重新加载' : '开始阅读'"
                  @click="emit('retry')"
                >
                  <template #icon>
                    <RotateCcw :size="16" aria-hidden="true" />
                  </template>
                </Button>
                <Button
                  v-if="error"
                  login-required
                  label="报告问题"
                  severity="secondary"
                  variant="text"
                  @click="emit('report')"
                >
                  <template #icon>
                    <Flag :size="16" aria-hidden="true" />
                  </template>
                </Button>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="mt-2 flex justify-center">
              <Button
                as="a"
                href="https://github.com/Ringyuki/Rito"
                target="_blank"
                size="small"
                class="py-1! text-xs!"
                variant="text"
                severity="secondary"
                label="由 Rito 驱动"
              >
                <template #icon>
                  <Icon name="simple-icons:github" class="size-1.5" />
                </template>
              </Button>
            </div>
          </template>
        </Card>
      </motion.div>
    </AnimatePresence>
  </div>
</template>
