<script setup lang="ts">
  import { computed } from 'vue'
  import { timeFromNow } from '~/utils/time-format'
  import { reasonLabel } from '~/features/hikari-points/labels'

  defineOptions({ name: 'HikariPointsLedgerDialog' })

  const { visible, records, loading, hasMore, loadMore } = useHikariPointLedger()
  const balance = computed(() => records.value[0]?.balance ?? 0)
  const initialLoading = computed(() => loading.value && records.value.length === 0)
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :style="{ width: '92vw', maxWidth: '440px' }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <span class="text-lg font-semibold text-color">光点明细</span>
        <Question title="关于光点" tooltip="了解光点" max-width="520px">
          <CheckinHikariPointContent />
        </Question>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <div class="flex items-baseline gap-1.5">
        <Skeleton v-if="initialLoading" width="3rem" height="2.25rem" class="self-center" />
        <span v-else class="text-3xl font-bold text-color">{{ balance }}</span>
        <HikariPoint class="size-5 self-center" aria-hidden="true" />
        <span class="text-sm text-muted-color">当前光点</span>
      </div>

      <div v-if="initialLoading" class="flex flex-col">
        <div
          v-for="i in 6"
          :key="i"
          class="flex items-center justify-between gap-3 border-b border-surface py-2.5 last:border-b-0"
        >
          <div class="flex min-w-0 flex-col gap-1.5">
            <Skeleton width="6rem" height="0.875rem" />
            <Skeleton width="4rem" height="0.75rem" />
          </div>
          <div class="flex shrink-0 flex-col items-end gap-1.5">
            <Skeleton width="3rem" height="0.875rem" />
            <Skeleton width="4rem" height="0.75rem" />
          </div>
        </div>
      </div>

      <div v-else-if="records.length" class="flex flex-col">
        <div
          v-for="record in records"
          :key="record.id"
          class="flex items-center justify-between gap-3 border-b border-surface py-2.5 last:border-b-0"
        >
          <div class="min-w-0">
            <p class="text-sm text-color">{{ reasonLabel(record.reason) }}</p>
            <p class="mt-0.5 text-xs text-muted-color">{{ timeFromNow(record.created_at) }}</p>
          </div>
          <div class="shrink-0 text-right">
            <p
              class="text-sm font-semibold"
              :class="
                record.action === 'ADD'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ record.action === 'ADD' ? '+' : '-' }}{{ record.amount }}
            </p>
            <p class="mt-0.5 text-xs text-muted-color">余额 {{ record.balance }}</p>
          </div>
        </div>
      </div>
      <p v-else class="py-8 text-center text-sm text-muted-color">还没有光点记录</p>

      <Button
        v-if="hasMore"
        label="加载更多"
        severity="secondary"
        text
        size="small"
        :loading="loading"
        class="self-center"
        @click="loadMore"
      />
    </div>
  </Dialog>
</template>
