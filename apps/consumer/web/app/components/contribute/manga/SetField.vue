<script setup lang="ts">
  import { FormField, Select } from '@hina-ui/vue'
  import { mangaSetName } from '@hikarinagi/shared'
  import type { MangaTargetSet } from '~/features/contribute/manga-target'

  const props = defineProps<{ sets: MangaTargetSet[] }>()
  const setId = defineModel<number | null>({ required: true })

  const options = computed(() =>
    props.sets.map(set => ({
      value: set.id,
      label: mangaSetName(set),
      description: `共 ${set.volume_count} 卷`,
    })),
  )
</script>

<template>
  <FormField v-if="sets.length > 1" name="set_entry_id" label="版本" required>
    <Select v-model="setId" :options="options" />
  </FormField>
</template>
