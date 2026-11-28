<script setup lang="ts">
  import { Button, CopyButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { Download } from '@lucide/vue'
  import type { LotteryPageData } from '~~/server/api/pages/lotteries/[id].get'

  const props = defineProps<{ lottery: LotteryPageData['lottery'] }>()

  const { t } = useLocaleText()
  const downloading = ref(false)
  const values = computed(() =>
    [
      { label: t('lottery.fairness.seedHash'), value: props.lottery.seed_hash },
      { label: t('lottery.fairness.seed'), value: props.lottery.seed },
    ].flatMap(item => (item.value ? [{ label: item.label, value: item.value }] : [])),
  )

  async function download() {
    downloading.value = true
    try {
      const participants = []
      for (let page = 1; ; page++) {
        const result = await hikariRequest('/api/v3/lotteries/{id}/participants', {
          path: { id: props.lottery.id },
          query: { page, page_size: 100 },
        })
        participants.push(...result.items)
        if (page >= result.meta.total_pages) break
      }
      const blob = new Blob([JSON.stringify(participants, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `lottery-${props.lottery.id}-participants.json`
      anchor.click()
      URL.revokeObjectURL(url)
    } finally {
      downloading.value = false
    }
  }
</script>

<template>
  <Stack gap="md">
    <Text as="p" size="sm" tone="muted" class="m-0! leading-relaxed">
      {{ t('lottery.fairness.method') }}
    </Text>
    <Stack gap="sm">
      <Inline
        v-for="item in values"
        :key="item.label"
        gap="md"
        align="center"
        :wrap="false"
        class="rounded-lg bg-subtle px-3 py-2"
      >
        <Text as="span" size="xs" tone="muted" class="w-14 shrink-0">{{ item.label }}</Text>
        <Text as="span" size="sm" truncate class="min-w-0 flex-1 font-mono">{{ item.value }}</Text>
        <CopyButton :text="item.value" :label="t('lottery.fairness.copy', { label: item.label })" />
      </Inline>
    </Stack>
    <Stack v-if="lottery.seed" gap="sm">
      <Text as="p" size="sm" tone="muted" class="m-0! leading-relaxed">
        {{ t('lottery.fairness.verify') }}
      </Text>
      <Button
        size="sm"
        variant="outline"
        tone="neutral"
        class="self-start"
        :loading="downloading"
        @click="download"
      >
        <template #icon><Download /></template>
        {{ t('lottery.fairness.download') }}
      </Button>
    </Stack>
  </Stack>
</template>
