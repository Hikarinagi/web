<script setup lang="ts">
  import { Button, Dialog, Stack, Text } from '@hina-ui/vue'
  import type { RelationRow } from '~/features/wiki/editor/relations'

  defineOptions({ name: 'WikiOrganizationPeriod' })

  const props = defineProps<{ row: RelationRow | null }>()
  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ done: [period: RelationRow['period']] }>()
  const period = ref<RelationRow['period']>({
    period_from: null,
    period_from_precision: null,
    period_to: null,
    period_to_precision: null,
  })

  watch(open, next => {
    if (next && props.row) period.value = { ...props.row.period }
  })

  function confirm() {
    emit('done', period.value)
    open.value = false
  }
</script>

<template>
  <Dialog v-model:open="open" title="修改期间" size="md">
    <template #content>
      <Stack gap="md">
        <Text v-if="row" size="sm" lang="ja">{{ row.other.label }}</Text>
        <WikiOrganizationPeriodFields v-model="period" />
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button @click="confirm">确定</Button>
    </template>
  </Dialog>
</template>
