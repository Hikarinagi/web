<script setup lang="ts">
  import { Button, Card, Link, Page, PageBody, Panel } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { versionName } from '~/features/wiki/history'
  import type { ComparePageData } from '~~/server/api/pages/entries/[id]/history/compare.get'

  defineOptions({ name: 'WikiHistoryCompare' })

  const props = defineProps<{ data: ComparePageData }>()
  const { typeName } = useWikiDefinitions()
  const base = computed(() => `/entries/${props.data.entry.id}/history`)
  const name = (at: string | null) => (at ? versionName(at) : '')
</script>

<template>
  <Page size="lg" class="max-md:py-4">
    <WikiPageHead
      :eyebrow="`${typeName(data.entry.type)}：${data.entry.label || '未命名'}`"
      title="两个版本的对照"
    >
      <template #actions>
        <Button :as="NuxtLink" :to="base" variant="outline" tone="neutral" size="sm">
          <template #icon><ArrowLeft /></template>
          修改记录
        </Button>
      </template>
    </WikiPageHead>
    <PageBody>
      <Panel :title="`从${name(data.comparison.from_at)}到${name(data.comparison.to_at)}`">
        <template #actions>
          <Link :as="NuxtLink" :to="`${base}/${data.comparison.from}`" class="text-sm">
            较早的版本
          </Link>
          <Link :as="NuxtLink" :to="`${base}/${data.comparison.to}`" class="text-sm">
            较晚的版本
          </Link>
        </template>
        <Card :padded="false" class="overflow-hidden">
          <WikiDiffTable
            :comparison="data.comparison"
            :names="data.names[data.entry.type]?.properties ?? {}"
          />
        </Card>
      </Panel>
    </PageBody>
  </Page>
</template>
