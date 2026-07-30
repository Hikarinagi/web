<script setup lang="ts">
  import { ArrowLeft, History, SquarePen } from '@lucide/vue'
  import type { RevisionHistoryPageData } from '~~/server/api/pages/revisions/[type]/[id].get'

  const props = defineProps<{ pageData: RevisionHistoryPageData; loading: boolean }>()
  const page = defineModel<number>('page', { required: true })

  const meta = computed(() => props.pageData.revisions.meta)
  const revisions = computed(() => props.pageData.revisions.items)
</script>

<template>
  <div class="mx-auto flex max-w-app flex-col gap-7 px-6 py-10">
    <header class="flex flex-col gap-5 border-b border-surface-200 pb-6 dark:border-surface-800">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <Button
          as="router-link"
          :to="pageData.resource.detail_to"
          label="返回详情"
          severity="secondary"
          outlined
          size="small"
        >
          <template #icon>
            <ArrowLeft class="size-4" aria-hidden="true" />
          </template>
        </Button>
        <Button
          as="router-link"
          :to="pageData.resource.edit_to"
          target="_blank"
          label="修订此条目"
          severity="secondary"
          outlined
          size="small"
        >
          <template #icon>
            <SquarePen class="size-4" aria-hidden="true" />
          </template>
        </Button>
      </div>

      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2 text-sm text-muted-color">
          <History class="size-4" aria-hidden="true" />
          <span>{{ pageData.resource.title }} 的修订历史</span>
        </div>
        <h1 class="text-2xl font-semibold tracking-normal text-surface-950 dark:text-surface-0">
          {{ pageData.resource.title }}
        </h1>
        <p v-if="pageData.resource.subtitle" class="text-sm text-muted-color">
          {{ pageData.resource.subtitle }}
        </p>
        <p class="text-sm text-muted-color">共 {{ meta.total_items }} 条修订记录</p>
      </div>
    </header>

    <div class="transition-opacity" :class="loading ? 'opacity-60' : 'opacity-100'">
      <div
        v-if="revisions.length"
        class="overflow-hidden rounded-md border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
      >
        <div
          class="hidden grid-cols-[112px_minmax(0,1fr)_172px] border-b border-surface-200 bg-surface-50 px-4 py-2 text-xs font-medium text-muted-color md:grid dark:border-surface-800 dark:bg-surface-900"
        >
          <span>版本</span>
          <span>变更内容</span>
          <span class="text-right">修订者</span>
        </div>
        <RevisionHistoryItem
          v-for="revision in revisions"
          :key="revision.id"
          :revision="revision"
          class="border-b border-surface-200 last:border-b-0 dark:border-surface-800"
        />
      </div>
      <div
        v-else
        class="rounded-lg border border-dashed border-surface-200 py-8 text-center text-sm text-muted-color dark:border-surface-800"
      >
        还没有修订记录
      </div>
    </div>

    <Paginator
      v-model:page="page"
      :meta="meta"
      :loading="loading"
      route="replace"
      align="between"
    />
  </div>
</template>
