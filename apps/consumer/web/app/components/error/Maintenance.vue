<script setup lang="ts">
  import { Button, Center, Heading, Inline, Stack, Text, toast } from '@hina-ui/vue'
  import { Clock, RefreshCw, Send } from '@lucide/vue'
  import type { NuxtError } from '#app'
  import type { SiteMaintenanceDetails, SiteMaintenanceStatus } from '@hikarinagi/shared'
  import { isRecord } from '#shared/utils/record'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'

  const props = defineProps<{
    error: NuxtError | Error
  }>()

  const checking = ref(false)
  const nowMs = ref(Date.now())

  const details = computed<SiteMaintenanceDetails>(() => {
    const data = (props.error as NuxtError).data
    if (isRecord(data) && isRecord(data.details)) return data.details as SiteMaintenanceDetails
    return {}
  })

  const title = computed(() => details.value.title?.trim() || '站点维护中')
  const message = computed(() => {
    const data = (props.error as NuxtError).data
    if (isRecord(data) && typeof data.message === 'string' && data.message.trim()) {
      return data.message.trim()
    }
    return '正在进行服务升级，很快回来。'
  })
  const telegramUrl = computed(
    () => details.value.telegram_url?.trim() || 'https://t.me/hikari_nagi',
  )
  const etaLine = computed(() => {
    const raw = details.value.ends_at
    if (!raw) return ''
    const targetMs = new Date(raw).getTime()
    if (Number.isNaN(targetMs)) return ''
    const diffMs = targetMs - nowMs.value
    if (diffMs <= 0) return '即将恢复'

    const target = new Date(targetMs)
    const now = new Date(nowMs.value)
    const pad = (n: number) => String(n).padStart(2, '0')
    const hhmm = `${pad(target.getHours())}:${pad(target.getMinutes())}`
    const sameDay =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    return sameDay
      ? `预计 ${hhmm} 恢复`
      : `预计 ${target.getMonth() + 1}月${target.getDate()}日 ${hhmm} 恢复`
  })

  async function retryConnection() {
    if (checking.value) return
    checking.value = true
    try {
      const response = await fetch('/__maintenance/status', {
        cache: 'no-store',
        headers: { accept: 'application/json' },
      })
      if (response.ok) {
        const status = (await response.json()) as Partial<SiteMaintenanceStatus>
        if (status.enabled === false) {
          reloadNuxtApp({ force: true })
          return
        }
        toast.info('仍在维护中，请稍后再试')
        return
      }
      reloadNuxtApp({ force: true })
    } catch {
      reloadNuxtApp({ force: true })
    } finally {
      checking.value = false
    }
  }

  let tickTimer: number | undefined
  onMounted(() => {
    tickTimer = window.setInterval(() => {
      nowMs.value = Date.now()
    }, 1000)
  })
  onBeforeUnmount(() => {
    if (tickTimer !== undefined) clearInterval(tickTimer)
  })
</script>

<template>
  <Stack gap="none" class="relative min-h-dvh bg-canvas">
    <Inline
      as="header"
      justify="between"
      align="center"
      :wrap="false"
      class="absolute inset-x-0 top-0 mx-auto w-full max-w-5xl px-6 py-6 sm:px-10"
    >
      <HikariImage
        :src="logoUrl"
        :alt="SITE_CONFIG.name"
        class="aspect-792/191 h-6 sm:h-7"
        image-class="object-contain"
        :lazy="false"
        :skeleton="false"
      />
      <ThemeToggle />
    </Inline>

    <Center as="main" class="min-h-dvh px-6 py-24">
      <Stack gap="none" align="center" class="max-w-xl text-center">
        <Heading :level="1" class="text-4xl font-semibold tracking-tight sm:text-5xl">
          {{ title }}
        </Heading>

        <Text as="p" size="base" tone="muted" class="mt-4 max-w-md text-lg leading-relaxed">
          {{ message }}
        </Text>

        <Inline v-if="etaLine" gap="xs" align="center" class="mt-5 text-muted">
          <Clock class="size-4" />
          <Text size="sm" tone="muted">{{ etaLine }}</Text>
        </Inline>

        <Inline gap="md" justify="center" class="mt-9">
          <Button size="lg" pill :loading="checking" @click="retryConnection">
            <template #icon><RefreshCw /></template>
            刷新试试
          </Button>
          <Button
            v-if="telegramUrl"
            as="a"
            :href="telegramUrl"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            variant="outline"
            tone="neutral"
            pill
          >
            <template #icon><Send /></template>
            Telegram 群组
          </Button>
        </Inline>
      </Stack>
    </Center>
  </Stack>
</template>
