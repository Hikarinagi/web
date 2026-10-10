<script setup lang="ts">
  import { Alert, Divider, Inline, LoadingOverlay, Stack, Text } from '@hina-ui/vue'
  import { formatBytes } from '~/features/download/format'
  import type { DownloadQuote } from '~/features/download/types'
  import type { DownloadBlock } from '~/features/download/useDownloadDialog'

  defineOptions({ name: 'DownloadQuote' })

  const props = defineProps<{
    quote: DownloadQuote | null
    quoting: boolean
    blocked: DownloadBlock | null
    unit: string
  }>()

  const extra = computed(() =>
    props.quote ? Math.max(0, props.quote.required_cards - props.quote.cards.available) : 0,
  )
  const cost = computed(() => extra.value * (props.quote?.cards.price ?? 0))
  const warning = computed(() => {
    const quote = props.quote
    if (!quote) return null
    const limits = quote.limits
    const remaining = Math.max(0, limits.daily_limit_bytes - limits.daily_used_bytes)
    switch (props.blocked) {
      case 'FILE_TOO_LARGE':
        return `单个文件超过 ${formatBytes(limits.file_max_bytes)} 的上限，请减少选择的${props.unit}数。`
      case 'DAILY_LIMIT':
        return `今日下载额度不足：本次需要 ${formatBytes(quote.new_bytes)}，剩余 ${formatBytes(remaining)}。再次下载已拥有的内容不占额度。`
      case 'MEMORY_LIMIT':
        return `此浏览器无法在下载的同时保存，因此每个文件限制为 ${formatBytes(limits.memory_fallback_max_bytes)}。请减少选择，或改用桌面浏览器。`
      default:
        return null
    }
  })
</script>

<template>
  <Stack gap="sm" class="relative rounded-lg bg-subtle p-4" aria-live="polite">
    <Inline justify="between" align="center" gap="md" :wrap="false">
      <Text size="sm" tone="muted">文件</Text>
      <Text size="sm" class="tabular-nums">
        {{ quote ? `${quote.files.length} 个，${formatBytes(quote.total_bytes)}` : '—' }}
      </Text>
    </Inline>
    <Inline justify="between" align="center" gap="md" :wrap="false">
      <Inline gap="xs" align="center" :wrap="false">
        <Text size="sm" tone="muted">下载卡</Text>
        <DownloadRules v-if="quote" :status="quote.cards" />
      </Inline>
      <Text size="sm" class="tabular-nums">{{ quote ? `${quote.required_cards} 张` : '—' }}</Text>
    </Inline>
    <Inline justify="between" align="center" gap="md" :wrap="false">
      <Text size="sm" tone="muted">持有</Text>
      <Text size="sm" class="tabular-nums">{{ quote ? `${quote.cards.available} 张` : '—' }}</Text>
    </Inline>
    <template v-if="extra">
      <Divider />
      <Inline justify="between" align="center" gap="md" :wrap="false">
        <Text size="sm" tone="muted">需购买</Text>
        <Inline gap="md" align="center" :wrap="false">
          <Text size="sm" weight="medium" class="tabular-nums">{{ extra }} 张</Text>
          <Inline as="span" gap="xs" align="center" :wrap="false">
            <HikariPoint class="size-3.5" aria-hidden="true" />
            <Text as="span" size="sm" weight="medium" class="tabular-nums">{{ cost }}</Text>
          </Inline>
        </Inline>
      </Inline>
    </template>
    <Alert :open="!!warning" tone="warning" :closable="false">{{ warning }}</Alert>
    <LoadingOverlay :visible="quoting" size="sm" />
  </Stack>
</template>
