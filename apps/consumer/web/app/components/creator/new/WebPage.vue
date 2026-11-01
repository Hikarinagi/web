<script setup lang="ts">
  import { FormField, Input, SegmentedControl, Stack } from '@hina-ui/vue'
  import { ENTRY_TYPE_NAMES } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorNewWebPage' })
  const emit = defineEmits<{ change: [] }>()
  const type = defineModel<string | null>('type', { required: true })
  const title = defineModel<string>('title', { required: true })

  const names = inject(
    ENTRY_TYPE_NAMES,
    computed<Record<string, string>>(() => ({})),
  )
  const options = computed(() =>
    ['GAME', 'PERSON', 'ORGANIZATION'].map(value => ({
      value,
      label: names.value[value] ?? value,
    })),
  )
  const typed = refDebounced(title, 500)
  watch([type, typed], ([kind, name]) => {
    if (kind && name.trim()) emit('change')
  })
</script>

<template>
  <Stack gap="md">
    <FormField name="type" label="条目类型">
      <SegmentedControl
        :model-value="type ?? undefined"
        :options="options"
        size="sm"
        class="self-start"
        @update:model-value="value => (type = String(value))"
      />
    </FormField>
    <FormField name="title" label="页面上写的名称">
      <Input v-model="title" lang="ja" />
    </FormField>
  </Stack>
</template>
