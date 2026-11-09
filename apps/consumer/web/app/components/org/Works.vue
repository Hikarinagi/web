<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import type { OrgListState } from '~/features/org/results'
  import { orgWorks, yearBuckets } from '~/features/org/works'

  defineOptions({ name: 'OrgWorks' })
  const props = defineProps<{
    data: ProducerPageData
    groups: { code: string; label: string; count: number }[]
    list: ProducerPageData['list']
    state: OrgListState
    pending: boolean
  }>()
  const emit = defineEmits<{ update: [partial: Partial<OrgListState>] }>()

  const works = computed(() => orgWorks(props.list.items))
  const rated = computed(() => props.data.stats.rating.count > 0)
  const update = (partial: Partial<OrgListState>) => emit('update', partial)
</script>

<template>
  <Stack gap="none">
    <OrgHistory
      v-if="data.mode === 'history'"
      :groups="groups"
      :total="data.stats.works"
      :works="works"
      :meta="list.meta"
      :state="state"
      :pending="pending"
      :rated="rated"
      @update="update"
    />
    <OrgShelf
      v-else-if="data.mode === 'shelf'"
      :groups="groups"
      :total="data.stats.works"
      :works="works"
      :meta="list.meta"
      :recent="orgWorks(data.extras.recent)"
      :years="yearBuckets(data.stats, state.tab)"
      :state="state"
      :pending="pending"
      :rated="rated"
      @update="update"
    />
    <OrgHub
      v-else-if="data.mode === 'hub'"
      :labels="data.extras.labels"
      :works="works"
      :groups="groups"
      :state="state"
      :pending="pending"
      @update="update"
    />
    <OrgSerials
      v-else
      :popular="orgWorks(data.extras.popular)"
      :works="works"
      :meta="list.meta"
      :state="state"
      :pending="pending"
      @update="update"
    />
  </Stack>
</template>
