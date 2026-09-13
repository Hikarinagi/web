<script setup lang="ts">
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
  <CardPanel title="动态" :icon="Logs">
    <template #actions>
      <SelectButton
        v-model="scope"
        :options="scopeOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
      />
    </template>
    <div v-if="items.length" class="flex flex-col">
      <CreatorContributionActivityItem
        v-for="(item, index) in items"
        :key="item.id"
        :item="item"
        :is-last="index === items.length - 1"
      />
    </div>
    <CreatorEmpty v-else :text="scope === 'mine' ? '你还没有贡献动态' : '还没有动态'" />
  </CardPanel>
</template>
