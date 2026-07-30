<script setup lang="ts">
  import { Home, RefreshCw } from '@lucide/vue'
  import type { NuxtError } from '#app'
  import { isRecord } from '#shared/utils/record'
  import page404Image from '~/assets/images/404/shion-page-404.webp'
  import pageErrorImage from '~/assets/images/error/shion-page-error.webp'
  import { cn } from '~/utils/cn'

  const props = withDefaults(
    defineProps<{
      error: NuxtError | Error
      reset?: () => void
      showHeader?: boolean
    }>(),
    {
      reset: undefined,
      showHeader: true,
    },
  )

  const statusCode = computed(() => {
    const error = props.error as NuxtError
    return error.status ?? 500
  })
  const isNotFound = computed(() => statusCode.value === 404)
  const title = computed(() => (isNotFound.value ? '什么都没有...' : '页面加载失败'))
  const description = computed(() =>
    isNotFound.value
      ? '这个地址没有匹配到可用页面，可能已经移动或被删除。'
      : '当前页面遇到未处理错误，可以重新加载或返回首页。',
  )
  const image = computed(() => (isNotFound.value ? page404Image : pageErrorImage))
  const detail = computed(() => {
    const error = props.error as NuxtError
    const raw = getMessage(error) || error.statusText || error.message || ''
    const normalized = String(raw).trim()
    return normalized
  })
  const requestId = computed(() => {
    const data = (props.error as NuxtError).data
    if (isRecord(data) && typeof data.request_id === 'string' && data.request_id.trim()) {
      return data.request_id.trim()
    }
    return ''
  })
  const mainClass = computed(() =>
    cn(
      'mx-auto min-h-[calc(100vh-4rem)] max-w-app px-6',
      'grid w-full items-center justify-items-center gap-8 text-center md:grid-cols-[minmax(0,0.95fr)_minmax(320px,1.05fr)] md:justify-items-stretch md:text-left',
      props.showHeader
        ? 'min-h-[calc(100dvh-var(--app-header-height))] pt-(--app-header-height)'
        : 'min-h-dvh',
    ),
  )

  function goHome() {
    props.reset?.()
    void clearError({ redirect: '/' })
  }

  function reloadPage() {
    props.reset?.()
    reloadNuxtApp({ force: true, persistState: true })
  }

  function getMessage(error: NuxtError) {
    const data = error.data
    if (isRecord(data)) {
      if (typeof data.message === 'string') return data.message
      if (isRecord(data.error) && typeof data.error.message === 'string') {
        return data.error.message
      }
    }
    return ''
  }
</script>

<template>
  <LayoutAppHeader v-if="showHeader" />
  <main :class="mainClass">
    <div class="flex max-w-xl flex-col items-center md:items-start">
      <Tag :value="String(statusCode)" :severity="isNotFound ? 'info' : 'danger'" class="mb-5" />
      <h1 class="text-4xl leading-tight font-semibold sm:text-5xl">
        {{ title }}
      </h1>
      <p class="mt-4 max-w-lg text-base leading-7 text-surface-600 dark:text-surface-300">
        {{ description }}
      </p>
      <p
        v-if="requestId"
        class="mt-4 flex max-w-lg items-center gap-2 text-xs text-surface-500 dark:text-surface-400"
      >
        <span class="shrink-0">Request ID</span>
        <code
          class="truncate rounded bg-surface-100 px-2 py-1 font-mono text-[11px] text-surface-700 dark:bg-surface-800 dark:text-surface-200"
        >
          {{ requestId }}
        </code>
      </p>
      <p
        v-if="detail"
        class="mt-5 max-w-lg rounded-md border border-surface-200 bg-surface-50 px-4 py-3 text-left text-sm leading-6 text-surface-600 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-300"
      >
        {{ detail }}
      </p>

      <div class="mt-8 flex w-auto items-center gap-3">
        <Button label="返回首页" @click="goHome">
          <template #icon>
            <Home :size="17" aria-hidden="true" />
          </template>
        </Button>
        <Button label="重新加载" severity="secondary" outlined @click="reloadPage">
          <template #icon>
            <RefreshCw :size="17" aria-hidden="true" />
          </template>
        </Button>
      </div>
    </div>

    <div
      class="relative mx-auto hidden w-full max-w-[320px] items-end justify-center md:mx-0 md:flex md:max-w-none"
    >
      <HikariImage
        :src="image"
        :alt="isNotFound ? '什么都没有...' : '页面加载失败'"
        class="relative aspect-square w-full overflow-visible"
        image-class="object-contain drop-shadow-[0_28px_52px_rgba(15,23,42,0.18)] dark:drop-shadow-[0_28px_52px_rgba(0,0,0,0.42)]"
        :lazy="false"
        :skeleton="false"
        :preload="{ fetchPriority: 'high' }"
      />
    </div>
  </main>
</template>
