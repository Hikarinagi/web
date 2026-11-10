<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import {
    LIGHT_NOVEL_STATUS_OPTIONS,
    type LightNovelBrowseState,
  } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelBrowseMore' })
  defineProps<{ state: LightNovelBrowseState }>()
  const emit = defineEmits<{ update: [next: Partial<LightNovelBrowseState>] }>()

  const loadBunko = (search: string) =>
    hikariRequest('/api/v3/light-novels/bunko', { query: { search: search || undefined } })
</script>

<template>
  <Stack gap="lg">
    <Stack gap="sm">
      <Text size="sm" weight="medium">出版状态</Text>
      <BrowseChoices
        single
        :model-value="state.novel_status ? [state.novel_status] : []"
        :options="LIGHT_NOVEL_STATUS_OPTIONS"
        @update:model-value="
          values =>
            emit('update', { novel_status: values[0] as LightNovelBrowseState['novel_status'] })
        "
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">文库</Text>
      <BrowseNamePicker
        single
        kind="bunko"
        placeholder="文库名"
        :load="loadBunko"
        :model-value="state.bunko_id ? [state.bunko_id] : []"
        @update:model-value="ids => emit('update', { bunko_id: ids[0] })"
      />
    </Stack>
  </Stack>
</template>
