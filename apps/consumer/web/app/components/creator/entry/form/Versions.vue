<script setup lang="ts">
  import { FormField, MultiSelect } from '@hina-ui/vue'
  import { ENTRY_VERSIONS } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryFormVersions' })
  const model = defineModel<number[]>({ required: true })

  const versions = inject(
    ENTRY_VERSIONS,
    computed(() => []),
  )
  const options = computed(() =>
    versions.value.map(item => ({ value: item.id, label: item.label })),
  )
</script>

<template>
  <FormField name="versions" label="版本">
    <MultiSelect
      v-model="model"
      variant="secondary"
      :options="options"
      clearable
      placeholder="全部版本"
    />
  </FormField>
</template>
