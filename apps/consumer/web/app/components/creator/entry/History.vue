<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { PageResult } from '@hikarinagi/shared'
  import type { BackendHistoryRow } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryHistory' })
  defineProps<{
    title: string
    editTo: string
    history: PageResult<BackendHistoryRow & { id: number }>
    loading: boolean
    revisionTo: (revision: number) => string | null
    compareTo: (from: number, to: number) => string
  }>()
  defineEmits<{ changed: [] }>()
  const page = defineModel<number>('page', { required: true })
</script>

<template>
  <Stack gap="lg">
    <Inline gap="md" align="center" justify="between">
      <Text as="p" size="sm" tone="muted" lang="ja">{{ title }}</Text>
      <Button :as="NuxtLink" :to="editTo" variant="outline" tone="neutral" size="sm">
        <template #icon><ArrowLeft /></template>
        返回编辑
      </Button>
    </Inline>
    <CreatorEntryHistoryTable
      v-model:page="page"
      :history="history"
      :loading="loading"
      :revision-to="revisionTo"
      :compare-to="compareTo"
      @changed="$emit('changed')"
    />
  </Stack>
</template>
