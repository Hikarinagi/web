<script setup lang="ts">
  import { FormField, FormLayout, NumberInput } from '@hina-ui/vue'
  import type { MangaTargetVolume } from '~/features/contribute/manga-target'

  const props = defineProps<{ volume: MangaTargetVolume | undefined }>()
  const part = defineModel<number | null | undefined>('part', { required: true })
  const count = defineModel<number | null | undefined>('count', { required: true })

  watch(
    () => props.volume?.id,
    () => {
      const editions = props.volume?.editions.length ?? 0
      if (editions >= 2 && count.value == null) count.value = editions
    },
    { immediate: true },
  )
</script>

<template>
  <FormLayout :columns="2">
    <FormField name="part" label="第几册" required>
      <NumberInput v-model="part" :min="1" :max="50" />
    </FormField>
    <FormField name="part_count" label="共几册" required>
      <NumberInput v-model="count" :min="2" :max="50" />
    </FormField>
  </FormLayout>
</template>
