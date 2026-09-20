<script setup lang="ts">
  import { summarizeRevisionDiff } from '~/features/revision/diff'
  import type { RevisionSummaryWithDiff } from '~/features/revision/resources'
  import { timeFormat } from '~/utils/time-format'

  const props = defineProps<{ revision: RevisionSummaryWithDiff }>()

  const diffSummary = computed(() => summarizeRevisionDiff(props.revision))
</script>

<template>
  <div
    class="grid bg-surface-0 transition-colors hover:bg-surface-50 md:grid-cols-[112px_minmax(0,1fr)_172px] dark:bg-surface-900 dark:hover:bg-surface-800/40"
  >
    <div
      class="flex items-start justify-between gap-3 border-b border-surface-100 px-4 py-3 md:block md:border-r md:border-b-0 md:border-surface-200 md:py-4 dark:border-surface-800"
    >
      <div class="font-mono text-sm font-medium text-surface-900 dark:text-surface-0">
        v{{ revision.version }}
      </div>
      <div class="mt-0.5 text-xs text-muted-color md:mt-1">
        {{ timeFormat(revision.created_at) }}
      </div>
    </div>

    <div class="min-w-0 px-4 py-3 md:py-4">
      <div class="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          class="min-w-0 flex-1 truncate text-sm font-medium text-surface-900 dark:text-surface-0"
        >
          {{ revision.summary || '未填写修订摘要' }}
        </h2>
        <span class="text-xs text-muted-color">
          {{ diffSummary.changeCount ? `${diffSummary.changeCount} 项变更` : '无字段变更' }}
        </span>
      </div>

      <div
        v-if="diffSummary.rows.length"
        class="mt-3 overflow-hidden rounded-md border border-surface-100 dark:border-surface-800"
      >
        <div
          v-for="(row, index) in diffSummary.rows"
          :key="index"
          class="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-2 border-b border-surface-100 px-2.5 py-1.5 text-xs leading-5 last:border-b-0 sm:grid-cols-[3rem_7rem_minmax(0,1fr)] dark:border-surface-800"
        >
          <span class="text-muted-color">{{ row.action }}</span>
          <span class="truncate text-surface-700 dark:text-surface-200">{{ row.label }}</span>
          <span class="col-span-2 min-w-0 truncate text-muted-color sm:col-span-1">
            {{ row.summary }}
          </span>
        </div>
        <div
          v-if="diffSummary.hiddenCount > 0"
          class="border-t border-surface-100 px-2.5 py-1.5 text-xs leading-5 text-muted-color dark:border-surface-800"
        >
          还有 {{ diffSummary.hiddenCount }} 项变更
        </div>
      </div>
    </div>

    <div
      class="flex min-w-0 items-center gap-2 border-t border-surface-100 px-4 py-3 text-xs md:justify-end md:border-t-0 md:border-l md:border-surface-200 md:py-4 dark:border-surface-800"
    >
      <UserCardTrigger :user-id="revision.editor.id">
        <Avatar :user="revision.editor" shape="circle" class="size-6!" />
      </UserCardTrigger>
      <UserName :user="revision.editor" class="min-w-0 text-surface-700 dark:text-surface-200" />
    </div>
  </div>
</template>
