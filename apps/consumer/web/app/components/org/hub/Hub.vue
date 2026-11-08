<script setup lang="ts">
  import { LoadingOverlay, SegmentedControl, SimpleGrid, Stack } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import type { OrgListState, OrgMedia } from '~/features/org/results'
  import type { OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHub' })
  const props = defineProps<{
    labels: ProducerPageData['extras']['labels']
    works: OrgWork[]
    groups: { code: string; label: string; count: number }[]
    state: OrgListState
    pending: boolean
  }>()
  const emit = defineEmits<{ update: [partial: Partial<OrgListState>] }>()

  const options = computed(() =>
    [
      { value: 'novel', label: '轻小说' },
      { value: 'manga', label: '漫画' },
    ].filter(option => props.groups.some(group => group.code === option.value)),
  )
  const media = computed({
    get: () => props.state.media ?? 'novel',
    set: (value: OrgMedia) => emit('update', { media: value }),
  })
</script>

<template>
  <Stack gap="none" class="gap-12">
    <Stack gap="md">
      <EntrySectionHead title="按文库" :count="labels.length" />
      <SimpleGrid min="17rem" gap="sm">
        <OrgHubLabel v-for="label in labels" :key="`${label.kind}${label.id}`" :label="label" />
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
      <Stack gap="none" class="relative">
        <SimpleGrid min="8.5rem" gap="md" class="gap-y-6">
          <OrgCatalogCard v-for="work in works" :key="`${work.kind}${work.id}`" :work="work" />
        </SimpleGrid>
        <LoadingOverlay :visible="pending" />
      </Stack>
    </Stack>
  </Stack>
</template>
