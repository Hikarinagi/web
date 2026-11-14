<script setup lang="ts">
  import { Button, Card, Empty, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { GitCompare } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'
  import { TimeFormatEnum, timeFormat } from '~/utils/time-format'

  defineOptions({ name: 'GalgameHistory' })
  const props = defineProps<{
    galgameId: number
    display: GalgameHistoryPageData['display']
    history: GalgameHistoryPageData['history']
    loading: boolean
  }>()
  const page = defineModel<number>('page', { required: true })

  type Row = GalgameHistoryPageData['history']['items'][number]

  const days = computed(() => {
    const year = new Date().getFullYear()
    const groups: { key: string; label: string; rows: Row[] }[] = []
    for (const row of props.history.items) {
      const key = timeFormat(row.created_at, TimeFormatEnum.YYYY_MM_DD)
      const last = groups.at(-1)
      if (last?.key === key) {
        last.rows.push(row)
        continue
      }
      const sameYear = new Date(row.created_at).getFullYear() === year
      const label = timeFormat(
        row.created_at,
        sameYear ? TimeFormatEnum.M_D_CN : TimeFormatEnum.YYYY_M_D_CN,
      )
      groups.push({ key, label, rows: [row] })
    }
    return groups
  })

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
  <Stack gap="lg" class="mx-auto max-w-app px-4 py-10 sm:px-6">
    <GalgameHistoryHeader
      :galgame-id="galgameId"
      :display="display"
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
          <GalgameHistoryRow
            v-for="(row, index) in day.rows"
            :key="row.revision ?? `old-${day.key}-${index}`"
            :row="row"
            :galgame-id="galgameId"
            :selected="row.revision !== null && selected.includes(row.revision)"
            @toggle="on => row.revision !== null && toggle(row.revision, on)"
          />
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
