<script setup lang="ts">
  import { Button, Code, Grid, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
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
      'mx-auto max-w-app px-6',
      'w-full items-center justify-items-center gap-8 text-center md:grid-cols-2 md:justify-items-stretch md:text-left',
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
  <Grid as="main" :cols="1" gap="none" :class="mainClass">
    <Stack gap="none" align="center" class="max-w-xl md:items-start">
      <Tag :tone="isNotFound ? 'info' : 'danger'" size="md" class="mb-5">{{ statusCode }}</Tag>
      <Heading :level="1" class="text-4xl leading-tight font-semibold sm:text-5xl">
        {{ title }}
      </Heading>
      <Text as="p" size="base" tone="muted" class="mt-4 max-w-lg leading-7">
        {{ description }}
      </Text>

      <Inline v-if="requestId" gap="sm" align="center" :wrap="false" class="mt-4 max-w-lg">
        <Text as="span" size="xs" tone="muted" class="shrink-0">Request ID</Text>
        <Code class="truncate text-xs">{{ requestId }}</Code>
      </Inline>

      <Text
        v-if="detail"
        as="p"
        size="sm"
        tone="muted"
        class="mt-5 max-w-lg rounded-md border border-line bg-subtle px-4 py-3 text-left leading-6"
      >
        {{ detail }}
      </Text>

      <Inline class="mt-8">
        <Button @click="goHome">
          <template #icon>
            <Home aria-hidden="true" />
          </template>
          返回首页
        </Button>
        <Button variant="outline" tone="neutral" @click="reloadPage">
          <template #icon>
            <RefreshCw aria-hidden="true" />
          </template>
          重新加载
        </Button>
      </Inline>
    </Stack>

    <Inline
      gap="none"
      align="end"
      justify="center"
      :wrap="false"
      class="relative mx-auto hidden w-full max-w-80 md:mx-0 md:flex md:max-w-none"
    >
      <HikariImage
        :src="image"
        :alt="isNotFound ? '什么都没有...' : '页面加载失败'"
        class="relative aspect-square w-full overflow-visible"
        image-class="object-contain drop-shadow-hikari-art dark:drop-shadow-hikari-art-dark"
        :lazy="false"
        :skeleton="false"
        :preload="{ fetchPriority: 'high' }"
      />
    </Inline>
  </Grid>
</template>
