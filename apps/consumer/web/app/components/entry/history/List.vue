<script setup lang="ts">
  import { Button, Card, Empty, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { GitCompare } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendEntryHistory } from '~/features/entry/contract'
  import { historyDays } from '~/features/entry/history'
  import {
    getRevisionEditPath,
    REVISION_RESOURCE_BASE_PATH,
    type RevisionResourceSlug,
  } from '~/features/revision/resources'

  defineOptions({ name: 'EntryHistoryList' })
  const props = defineProps<{
    resource: RevisionResourceSlug
    resourceId: number
    title: string
    subtitle: string | null
    history: BackendEntryHistory
    loading: boolean
    snapshots?: boolean
  }>()
  const page = defineModel<number>('page', { required: true })

  const base = computed(() => `${REVISION_RESOURCE_BASE_PATH[props.resource]}/${props.resourceId}`)
  const days = computed(() => historyDays(props.history.items))

  const selected = ref<number[]>([])
  const toggle = (revision: number, on: boolean) => {
    const rest = selected.value.filter(item => item !== revision)
    selected.value = on ? [...rest, revision].slice(-2) : rest
  }
  const compareTo = computed(() => {
    if (selected.value.length !== 2) return null
    const [from, to] = [...selected.value].sort((a, b) => a - b)
    return `${base.value}/revisions/compare?from=${from}&to=${to}`
  })
</script>

<template>
  <Stack gap="lg" class="mx-auto max-w-app px-4 py-10 sm:px-6">
    <EntryHistoryHeader
      :to="base"
      :edit-to="getRevisionEditPath(resource, resourceId)"
      :title="title"
      :subtitle="subtitle"
      :total="history.meta.total_items"
    />
    <Inline align="center" justify="between" gap="md">
      <Text size="sm" tone="muted">已选 {{ selected.length }} 条</Text>
      <Button
        :as="compareTo ? NuxtLink : 'button'"
        :to="compareTo ?? undefined"
        :disabled="!compareTo"
      >
        <template #icon><GitCompare /></template>
        比较所选的两条修订
      </Button>
    </Inline>
    <Stack
      v-if="days.length"
      gap="xl"
      class="transition-opacity"
      :class="loading ? 'opacity-60' : 'opacity-100'"
    >
      <Stack v-for="day in days" :key="day.key" as="section" gap="sm">
        <Heading :level="2" size="sm" class="px-1 text-muted">{{ day.label }}</Heading>
        <Card :padded="false" class="divide-y divide-line">
          <Stack v-for="batch in day.batches" :key="batch.key" gap="none">
            <Text v-if="batch.label" size="xs" tone="muted" class="bg-subtle px-4 py-2 sm:px-5">
              {{ batch.label }}
            </Text>
            <Stack gap="none" class="divide-y divide-line">
              <EntryHistoryRow
                v-for="(row, index) in batch.rows"
                :key="row.revision ?? `old-${batch.key}-${index}`"
                :row="row"
                :to="base"
                :snapshots="snapshots"
                :selected="row.revision !== null && selected.includes(row.revision)"
                @toggle="on => row.revision !== null && toggle(row.revision, on)"
              />
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Stack>
    <Empty v-else size="sm" title="暂无修订" />
    <Paginator
      v-model:page="page"
      :meta="history.meta"
      :loading="loading"
      route="replace"
      align="between"
    />
  </Stack>
</template>
