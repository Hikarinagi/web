<script setup lang="ts">
  import { Panel, SegmentedControl, Stack } from '@hina-ui/vue'
  import { Logs } from '@lucide/vue'
  import type { BackendContributionActivityItem } from '~/features/creator/contribution'

  const props = defineProps<{ initialItems: BackendContributionActivityItem[] }>()

  const auth = useAuthStore()
  const scope = ref<'all' | 'mine'>('all')
  const scopeOptions = [
    { label: '全站', value: 'all' },
    { label: '我的', value: 'mine' },
  ]

  const fetched = ref<BackendContributionActivityItem[] | null>(null)
  const items = computed(() => fetched.value ?? props.initialItems)
  let seq = 0

  async function load() {
    const current = ++seq
    try {
      const result = await hikariRequest('/api/v3/contribution/activity', {
        query: {
          actor_id: scope.value === 'mine' ? auth.user?.id : undefined,
          page: 1,
          page_size: 12,
        },
      })
      if (current === seq) fetched.value = result.items
    } catch {
      if (current === seq) fetched.value = []
    }
  }

  watch(scope, load)
</script>

<template>
  <Panel title="动态">
    <template #icon><Logs /></template>
    <template #actions>
      <SegmentedControl v-model="scope" :options="scopeOptions" size="sm" aria-label="动态范围" />
    </template>
    <Stack v-if="items.length" gap="none">
      <CreatorContributionActivityItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :is-last="index === items.length - 1"
      />
    </Stack>
    <CreatorEmpty v-else :text="scope === 'mine' ? '你还没有贡献动态' : '还没有动态'" />
  </Panel>
</template>
