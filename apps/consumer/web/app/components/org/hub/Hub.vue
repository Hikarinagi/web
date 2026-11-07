<script setup lang="ts">
  import { SegmentedControl, SimpleGrid, Stack } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { today, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHub' })
  const props = defineProps<{
    works: OrgWork[]
    relations: ProducerPageData['relations']
  }>()

  const RECENT = 18
  const media = ref('novel')
  const children = computed(
    () =>
      new Set(
        (props.relations ?? [])
          .filter(item => item.relation === 'SUBSIDIARY')
          .map(item => item.target_producer.id),
      ),
  )
  const labels = computed(() => {
    const groups = new Map<
      string,
      { id: number | null; name: string; works: OrgWork[]; own: boolean }
    >()
    for (const work of props.works) {
      const key = work.kind === 'manga' ? 'manga' : work.label ? `label:${work.label.id}` : 'none'
      const entry = groups.get(key) ?? {
        id: work.kind === 'novel' ? (work.label?.id ?? null) : null,
        name: work.kind === 'manga' ? '漫画' : (work.label?.name ?? '未标文库的轻小说'),
        works: [],
        own: Boolean(work.label) && children.value.has(work.label!.id),
      }
      entry.works.push(work)
      groups.set(key, entry)
    }
    return [...groups.values()].sort(
      (a, b) => Number(b.own) - Number(a.own) || b.works.length - a.works.length,
    )
  })
  const options = computed(() =>
    [
      { value: 'novel', label: '轻小说' },
      { value: 'manga', label: '漫画' },
    ].filter(option => props.works.some(work => work.kind === option.value)),
  )
  const recent = computed(() =>
    props.works
      .filter(work => work.kind === media.value && work.date && work.date <= today())
      .slice(0, RECENT),
  )
</script>

<template>
  <Stack gap="none" class="gap-12">
    <Stack gap="md">
      <EntrySectionHead title="按文库" :count="labels.length" />
      <SimpleGrid min="17rem" gap="sm">
        <OrgHubLabel v-for="label in labels" :key="label.name" :label="label" />
      </SimpleGrid>
    </Stack>
    <Stack gap="md">
      <EntrySectionHead id="works" title="最近出版">
        <template #actions>
          <SegmentedControl
            v-if="options.length > 1"
            v-model="media"
            :options="options"
            size="sm"
            aria-label="媒介"
          />
        </template>
      </EntrySectionHead>
      <SimpleGrid min="8.5rem" gap="md" class="gap-y-6">
        <OrgCatalogCard v-for="work in recent" :key="`${work.kind}${work.id}`" :work="work" />
      </SimpleGrid>
    </Stack>
  </Stack>
</template>
