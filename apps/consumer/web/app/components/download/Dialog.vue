<script setup lang="ts">
  import { Button, Dialog, Inline, Spinner, Stack, Text } from '@hina-ui/vue'
  import type { DownloadCards } from '~/features/download/types'

  defineProps<{
    title: string
    format: 'EPUB' | 'CBZ'
    summary: string
    status: DownloadCards | null
    required: number | null
    quoting: boolean
    needsCard: boolean
    busy: boolean
    disabled: boolean
    resume?: boolean
    finished?: boolean
  }>()
  const open = defineModel<boolean>('open', { required: true })
  defineEmits<{ download: []; stop: []; reselect: [] }>()
</script>

<template>
  <Dialog v-model:open="open" title="下载" :description="title" size="lg" :locked="busy">
    <template #content>
      <Stack gap="lg">
        <slot />
        <Inline justify="between">
          <Text>{{ summary }}</Text>
          <Text size="sm" tone="muted">{{ format }}</Text>
        </Inline>
        <Inline justify="between" gap="md" class="border-t border-line pt-4">
          <Inline gap="xs" aria-live="polite" :aria-busy="quoting">
            <Text v-if="required !== null" size="sm" weight="medium"
              >本次使用 {{ required }} 张下载卡</Text
            >
            <Text v-else-if="quoting" size="sm" tone="muted">正在计算</Text>
            <Spinner v-if="quoting" size="sm" />
            <DownloadRules v-if="status" :status="status" />
          </Inline>
          <Text size="sm" tone="muted" class="shrink-0">持有 {{ status?.available ?? 0 }} 张</Text>
        </Inline>
      </Stack>
    </template>
    <template #footer>
      <Button v-if="busy" variant="ghost" tone="neutral" @click="$emit('stop')">停止下载</Button>
      <Button v-else-if="resume" variant="ghost" tone="neutral" @click="$emit('reselect')"
        >重新选择</Button
      >
      <Button v-else variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button :disabled="disabled" :loading="busy" @click="$emit('download')">
        {{ needsCard ? '购买下载卡' : finished ? '再次下载' : resume ? '继续下载' : '下载' }}
      </Button>
    </template>
  </Dialog>
</template>
