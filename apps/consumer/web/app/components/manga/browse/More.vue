<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import {
    MANGA_AUDIENCE_OPTIONS,
    MANGA_REGION_OPTIONS,
    type MangaBrowseState,
  } from '~/features/manga/explore'

  defineOptions({ name: 'MangaBrowseMore' })
  const props = defineProps<{ state: MangaBrowseState; genres: { key: string; name: string }[] }>()
  const emit = defineEmits<{ update: [next: Partial<MangaBrowseState>] }>()

  const genreOptions = computed(() =>
    props.genres.map(genre => ({ value: genre.key, label: genre.name })),
  )
  const loadMagazines = (search: string) =>
    hikariRequest('/api/v3/mangas/magazines', { query: { search: search || undefined } })
</script>

<template>
  <Stack gap="lg">
    <Stack v-if="genreOptions.length" gap="sm">
      <Text size="sm" weight="medium">题材</Text>
      <BrowseChoices
        :model-value="state.genre"
        :options="genreOptions"
        @update:model-value="genre => emit('update', { genre })"
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">读者对象</Text>
      <BrowseChoices
        single
        :model-value="state.audience ? [state.audience] : []"
        :options="MANGA_AUDIENCE_OPTIONS"
        @update:model-value="
          values => emit('update', { audience: values[0] as MangaBrowseState['audience'] })
        "
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">地区</Text>
      <BrowseChoices
        single
        :model-value="state.region ? [state.region] : []"
        :options="MANGA_REGION_OPTIONS"
        @update:model-value="
          values => emit('update', { region: values[0] as MangaBrowseState['region'] })
        "
      />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" weight="medium">杂志</Text>
      <BrowseNamePicker
        single
        kind="magazine"
        placeholder="杂志名"
        :load="loadMagazines"
        :model-value="state.magazine_id ? [state.magazine_id] : []"
        @update:model-value="ids => emit('update', { magazine_id: ids[0] })"
      />
    </Stack>
  </Stack>
</template>
