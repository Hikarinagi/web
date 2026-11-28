<script setup lang="ts">
  import { Card, Divider, Empty, Stack } from '@hina-ui/vue'
  import type { PrizesPageData } from '~~/server/api/pages/me/prizes.get'
  import { usePrizeResults } from '~/features/lottery/composables/usePrizeResults'

  const props = defineProps<{ initial: PrizesPageData }>()

  const { t } = useLocaleText()
  const { displayed, pending, reload } = usePrizeResults(props.initial)
</script>

<template>
  <Stack gap="md">
    <Card v-if="displayed.list.items.length" :padded="false">
      <template v-for="(item, index) in displayed.list.items" :key="item.id">
        <Divider v-if="index > 0" />
        <MePrizeRow :item="item" @changed="reload" />
      </template>
    </Card>
    <Empty v-else :title="t('lottery.noPrizes')" />
    <Paginator :meta="displayed.list.meta" :loading="pending" route="push" />
  </Stack>
</template>
