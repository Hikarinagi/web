<script setup lang="ts">
  import { Heading, Stack, Text } from '@hina-ui/vue'
  import { GALGAME_STATUS_LABEL, type GalgameRateStatus } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameExploreRecordDoneStep' })

  defineProps<{
    selectedTitle: string
    status: GalgameRateStatus
  }>()
</script>

<template>
  <Stack gap="sm" align="center" justify="center" class="min-h-105 text-center">
    <Heading :level="3" size="lg">进度已经记录啦</Heading>
    <Text size="sm" tone="muted" class="max-w-md leading-6">
      《{{ selectedTitle }}》已设为「{{ GALGAME_STATUS_LABEL[status] }}」
    </Text>
  </Stack>
</template>
