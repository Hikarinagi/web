<script setup lang="ts">
  import {
    Button,
    Empty,
    Heading,
    Inline,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ArrowLeft, History, SquarePen } from '@lucide/vue'
  import type { RevisionHistoryPageData } from '~~/server/api/pages/revisions/[type]/[id].get'

  const props = defineProps<{ pageData: RevisionHistoryPageData; loading: boolean }>()
  const page = defineModel<number>('page', { required: true })

  const meta = computed(() => props.pageData.revisions.meta)
  const revisions = computed(() => props.pageData.revisions.items)
</script>

<template>
  <Stack gap="lg" class="mx-auto max-w-app px-6 py-10">
    <Stack as="header" gap="md" class="border-b border-line pb-6">
      <Inline gap="sm" align="center" justify="between" wrap>
        <Button
          :as="NuxtLink"
          :to="pageData.resource.detail_to"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><ArrowLeft /></template>
          返回详情
        </Button>
        <Button
          :as="NuxtLink"
          :to="pageData.resource.edit_to"
          target="_blank"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><SquarePen /></template>
          修订此条目
        </Button>
      </Inline>

      <Stack gap="xs" align="start">
        <Inline gap="sm" align="center">
          <History class="size-4" aria-hidden="true" />
          <Text as="span" size="sm" tone="muted">{{ pageData.resource.title }} 的修订历史</Text>
        </Inline>
        <Heading :level="1" size="2xl">{{ pageData.resource.title }}</Heading>
        <Text v-if="pageData.resource.subtitle" as="p" size="sm" tone="muted">
          {{ pageData.resource.subtitle }}
        </Text>
        <Text as="p" size="sm" tone="muted">共 {{ meta.total_items }} 条修订记录</Text>
      </Stack>
    </Stack>

    <Stack gap="none" class="transition-opacity" :class="loading ? 'opacity-60' : 'opacity-100'">
      <Table v-if="revisions.length" class="hikari-table-stack">
        <TableHeader class="hidden md:table-header-group">
          <TableRow>
            <TableHead class="w-28 px-4 text-xs">版本</TableHead>
            <TableHead class="px-4 text-xs">变更内容</TableHead>
            <TableHead align="end" class="w-43 px-4 text-xs">修订者</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <RevisionHistoryItem
            v-for="revision in revisions"
            :key="revision.id"
            :revision="revision"
          />
        </TableBody>
      </Table>
      <Empty v-else size="sm" title="还没有修订记录" />
    </Stack>

    <Paginator
      v-model:page="page"
      :meta="meta"
      :loading="loading"
      route="replace"
      align="between"
    />
  </Stack>
</template>
