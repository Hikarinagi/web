<script setup lang="ts">
  import { Select, Stack, Switch, Text } from '@hina-ui/vue'
  import { fetchEntitySearch } from '~/features/creator/composables/useEntitySearch'
  import type { GalgameBrowseState } from '~/features/galgame/explore'
  import { LANGUAGE_OPTIONS, STAFF_ROLE_LABELS } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameBrowseMore' })
  defineProps<{ state: GalgameBrowseState }>()
  const emit = defineEmits<{ update: [next: Partial<GalgameBrowseState>] }>()

  const roles = [
    { value: '', label: '全部职责' },
    ...Object.entries(STAFF_ROLE_LABELS).map(([value, label]) => ({ value, label })),
  ]
  const loadProducers = (search: string) =>
    fetchEntitySearch('producer', search, 24, {
      scope: 'public',
      producerTypes: ['COMPANY', 'DOUJIN'],
    })
  const loadPeople = (search: string) =>
    fetchEntitySearch('person', search, 24, { scope: 'public' })
</script>

<template>
  <Stack gap="lg">
    <Stack gap="sm">
      <Text size="sm" weight="medium">平台</Text>
      <GalgameBrowsePlatforms
        :model-value="state.platforms"
        @update:model-value="platforms => emit('update', { platforms })"
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">语言</Text>
      <BrowseChoices
        :model-value="state.origin_lang"
        :options="LANGUAGE_OPTIONS"
        @update:model-value="origin_lang => emit('update', { origin_lang })"
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">品牌</Text>
      <BrowseNamePicker
        kind="producer"
        placeholder="品牌名"
        :load="loadProducers"
        :model-value="state.producer_ids"
        @update:model-value="producer_ids => emit('update', { producer_ids })"
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">制作人员</Text>
      <BrowseNamePicker
        kind="staff"
        placeholder="制作人员名"
        :load="loadPeople"
        :model-value="state.staff_person_ids"
        @update:model-value="staff_person_ids => emit('update', { staff_person_ids })"
      />
      <Select
        v-if="state.staff_person_ids.length"
        :model-value="state.staff_role ?? ''"
        :options="roles"
        aria-label="职责"
        @update:model-value="
          value =>
            emit('update', { staff_role: (value || undefined) as GalgameBrowseState['staff_role'] })
        "
      />
    </Stack>
    <Switch
      :model-value="state.include_dev"
      @update:model-value="include_dev => emit('update', { include_dev })"
    >
      包含开发中与已中止
    </Switch>
  </Stack>
</template>
