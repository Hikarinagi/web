<script setup lang="ts">
  import { Card, Grid, Ripple, Stack, Text } from '@hina-ui/vue'
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    GALGAME_STATUS_SUB,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'
  import { GALGAME_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameExploreRecordStatusPicker' })

  const value = defineModel<GalgameRateStatus>({ required: true })

  const items = GALGAME_STATUS_ORDER.map(status => ({
    status,
    label: GALGAME_STATUS_LABEL[status],
    sub: GALGAME_STATUS_SUB[status],
    icon: STATUS_ICON[status],
  }))
</script>

<template>
  <Grid :cols="2" gap="sm" class="sm:grid-cols-5">
    <Card
      v-for="item in items"
      :key="item.status"
      as="button"
      type="button"
      :padded="false"
      :aria-pressed="value === item.status"
      :class="
        cn(
          'hn-state-layer min-h-20 w-full hn-interactive p-3 text-start hn-press-lg',
          value === item.status && 'border-accent bg-accent-soft text-accent-text',
        )
      "
      @click="value = item.status"
    >
      <Ripple />
      <Stack gap="sm" align="start">
        <component :is="item.icon" class="size-4.5" aria-hidden="true" />
        <Stack gap="none" align="start" class="min-w-0">
          <Text as="span" size="sm" weight="semibold">{{ item.label }}</Text>
          <Text as="span" size="xs" tone="muted">{{ item.sub }}</Text>
        </Stack>
      </Stack>
    </Card>
  </Grid>
</template>
