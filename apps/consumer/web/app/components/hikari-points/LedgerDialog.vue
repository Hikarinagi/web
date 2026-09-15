<script setup lang="ts">
  import { computed } from 'vue'
  import { Button, Dialog, Empty, Inline, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { timeFromNow } from '~/utils/time-format'
  import { reasonLabel } from '~/features/hikari-points/labels'

  defineOptions({ name: 'HikariPointsLedgerDialog' })

  const { visible, records, loading, hasMore, loadMore } = useHikariPointLedger()
  const balance = computed(() => records.value[0]?.balance ?? 0)
  const initialLoading = computed(() => loading.value && records.value.length === 0)
</script>

<template>
  <Dialog v-model:open="visible" title="光点明细" size="md">
    <template #content>
      <Stack gap="md">
        <Inline gap="xs" align="baseline">
          <Skeleton v-if="initialLoading" class="h-9 w-12 self-center" />
          <Text v-else as="span" size="2xl" weight="semibold">{{ balance }}</Text>
          <HikariPoint class="size-5 self-center" aria-hidden="true" />
          <Text as="span" size="sm" tone="muted">当前光点</Text>
          <Question title="关于光点" tooltip="了解光点" size="lg">
            <CheckinHikariPointContent />
          </Question>
        </Inline>

        <Stack v-if="initialLoading" gap="none">
          <Inline
            v-for="i in 6"
            :key="i"
            gap="sm"
            justify="between"
            class="border-b border-line py-2.5 last:border-b-0"
          >
            <Stack gap="xs" class="min-w-0">
              <Skeleton class="h-3.5 w-24" />
              <Skeleton class="h-3 w-16" />
            </Stack>
            <Stack gap="xs" align="end" class="shrink-0">
              <Skeleton class="h-3.5 w-12" />
              <Skeleton class="h-3 w-16" />
            </Stack>
          </Inline>
        </Stack>

        <Stack v-else-if="records.length" gap="none">
          <Inline
            v-for="record in records"
            :key="record.id"
            gap="sm"
            justify="between"
            class="border-b border-line py-2.5 last:border-b-0"
          >
            <Stack gap="none" class="min-w-0">
              <Text size="sm">{{ reasonLabel(record.reason) }}</Text>
              <Text size="xs" tone="muted">{{ timeFromNow(record.created_at) }}</Text>
            </Stack>
            <Stack gap="none" align="end" class="shrink-0">
              <Text
                size="sm"
                weight="semibold"
                :tone="record.action === 'ADD' ? 'success' : 'danger'"
              >
                {{ record.action === 'ADD' ? '+' : '-' }}{{ record.amount }}
              </Text>
              <Text size="xs" tone="muted">余额 {{ record.balance }}</Text>
            </Stack>
          </Inline>
        </Stack>

        <Empty v-else size="sm" title="还没有光点记录" />

        <Button
          v-if="hasMore"
          variant="ghost"
          tone="neutral"
          size="sm"
          :loading="loading"
          class="self-center"
          @click="loadMore"
        >
          加载更多
        </Button>
      </Stack>
    </template>
  </Dialog>
</template>
