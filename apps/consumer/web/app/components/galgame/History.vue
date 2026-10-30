<script setup lang="ts">
  import {
    Button,
    Empty,
    Inline,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { GitCompare } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'

  defineOptions({ name: 'GalgameHistory' })
  const props = defineProps<{
    galgameId: number
    display: GalgameHistoryPageData['display']
    history: GalgameHistoryPageData['history']
    loading: boolean
  }>()
  const page = defineModel<number>('page', { required: true })

  const selected = ref<number[]>([])
  const toggle = (revision: number, on: boolean) => {
    const rest = selected.value.filter(item => item !== revision)
    selected.value = on ? [...rest, revision].slice(-2) : rest
  }
  const compareTo = computed(() => {
    if (selected.value.length !== 2) return null
    const [from, to] = [...selected.value].sort((a, b) => a - b)
    return `/galgames/${props.galgameId}/revisions/compare?from=${from}&to=${to}`
  })
</script>

<template>
  <Stack gap="lg" class="mx-auto max-w-app px-6 py-10">
    <GalgameHistoryHeader
      :galgame-id="galgameId"
      :display="display"
      :total="history.meta.total_items"
    />
    <Inline align="center" justify="between" gap="md">
      <Text size="sm" tone="muted">
        已选 {{ selected.length }} 条<template v-if="!compareTo">，选择两条修订以进行比较</template>
      </Text>
      <Button
        :as="compareTo ? NuxtLink : 'button'"
        :to="compareTo ?? undefined"
        :disabled="!compareTo"
      >
        <template #icon><GitCompare /></template>
        比较所选的两条修订
      </Button>
    </Inline>
    <Stack gap="none" class="transition-opacity" :class="loading ? 'opacity-60' : 'opacity-100'">
      <Table v-if="history.items.length">
        <TableHeader>
          <TableRow>
            <TableHead><span class="sr-only">选择</span></TableHead>
            <TableHead>时间</TableHead>
            <TableHead>编辑者</TableHead>
            <TableHead>摘要</TableHead>
            <TableHead><span class="sr-only">查看此修订下的条目</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <GalgameHistoryRow
            v-for="(row, index) in history.items"
            :key="row.revision ?? `old-${index}`"
            :row="row"
            :galgame-id="galgameId"
            :selected="row.revision !== null && selected.includes(row.revision)"
            @toggle="on => row.revision !== null && toggle(row.revision, on)"
          />
        </TableBody>
      </Table>
      <Empty v-else size="sm" title="暂无修订" />
    </Stack>
    <Paginator
      v-model:page="page"
      :meta="history.meta"
      :loading="loading"
      route="replace"
      align="between"
    />
  </Stack>
</template>
