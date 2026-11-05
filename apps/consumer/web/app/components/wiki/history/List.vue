<script setup lang="ts">
  import { Button, Empty, Page, PageBody, Panel, Stack } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { HistoryPageData } from '~~/server/api/pages/entries/[id]/history.get'

  defineOptions({ name: 'WikiHistoryList' })

  const props = defineProps<{ data: HistoryPageData; loading: boolean }>()
  const { typeName } = useWikiDefinitions()
  const picked = ref<number[]>([])
  const revisionOf = (id: number) =>
    props.data.changes.items
      .find(change => change.id === id)
      ?.entries.find(part => part.id === props.data.entry.id)?.revision ?? null

  function pick(id: number, on: boolean) {
    const rest = picked.value.filter(item => item !== id)
    picked.value = on ? [...rest.slice(-1), id] : rest
  }

  function compare() {
    const [from, to] = picked.value
      .map(revisionOf)
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b)
    if (from && to)
      void navigateTo({
        path: `/entries/${props.data.entry.id}/history/compare`,
        query: { from: String(from), to: String(to) },
      })
  }
</script>

<template>
  <Page size="lg" class="max-md:py-4">
    <WikiPageHead
      :eyebrow="`${typeName(data.entry.type)}的修改记录`"
      :title="data.entry.label || '未命名'"
      lang="ja"
    >
      <template #actions>
        <Button
          :as="NuxtLink"
          :to="`/entries/${data.entry.id}/edit`"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><ArrowLeft /></template>
          编辑
        </Button>
        <Button size="sm" :disabled="picked.length !== 2" @click="compare">
          对照所选的两个版本
        </Button>
      </template>
    </WikiPageHead>
    <PageBody>
      <Panel title="修改记录" :count="data.changes.meta.total_items" :padded="false">
        <Empty v-if="!data.changes.items.length" title="暂无修改记录" />
        <Stack v-else gap="none" align="stretch" class="divide-y divide-line">
          <WikiHistoryRow
            v-for="change in data.changes.items"
            :key="change.id"
            :change="change"
            :entry="data.entry.id"
            :selected="picked.includes(change.id)"
            @update:selected="on => pick(change.id, on)"
          />
        </Stack>
        <Paginator
          v-if="data.changes.meta.total_pages > 1"
          :meta="data.changes.meta"
          :loading="loading"
          route="push"
          align="center"
          class="border-t border-line px-(--hn-panel-p) py-3"
        />
      </Panel>
    </PageBody>
  </Page>
</template>
