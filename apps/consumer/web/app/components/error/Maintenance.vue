<script setup lang="ts">
  import { Button, Center, Heading, Inline, Stack, Text, toast } from '@hina-ui/vue'
  import { Clock, RefreshCw, Send } from '@lucide/vue'
  import type { NuxtError } from '#app'
  import type { SiteMaintenanceDetails, SiteMaintenanceStatus } from '@hikarinagi/shared'
  import { isRecord } from '#shared/utils/record'
  import logoUrl from '~/assets/images/wordmark.svg'
  import { SITE_CONFIG } from '~/config/site'
  import { pageErrorMessage } from '~/utils/api/error'

  const props = defineProps<{
    error: NuxtError | Error
  }>()

  const { t, d } = useLocaleText()
  const checking = ref(false)
  const nowMs = ref(Date.now())

  const details = computed<SiteMaintenanceDetails>(() => {
    const data = (props.error as NuxtError).data
    if (isRecord(data) && isRecord(data.details)) return data.details as SiteMaintenanceDetails
    return {}
  })

  const title = computed(() => details.value.title?.trim() || t('error.maintenance.title'))
  const message = computed(
    () => pageErrorMessage(props.error).trim() || t('error.maintenance.message'),
  )
  const telegramUrl = computed(
    () => details.value.telegram_url?.trim() || 'https://t.me/hikari_nagi',
  )
  const etaLine = computed(() => {
    const raw = details.value.ends_at
    if (!raw) return ''
    const targetMs = new Date(raw).getTime()
    if (Number.isNaN(targetMs)) return ''
    const diffMs = targetMs - nowMs.value
    if (diffMs <= 0) return t('error.maintenance.soon')

    const target = new Date(targetMs)
    const now = new Date(nowMs.value)
    const time = d(target, 'time')
    const sameDay =
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    return sameDay
      ? t('error.maintenance.etaToday', { time })
      : t('error.maintenance.eta', { date: formatDate(target, 'monthDay'), time })
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
        toast.info(t('error.maintenance.stillDown'))
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
            {{ t('error.maintenance.retry') }}
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
            {{ t('error.maintenance.telegram') }}
          </Button>
        </Inline>
      </Stack>
    </Center>
  </Stack>
</template>
