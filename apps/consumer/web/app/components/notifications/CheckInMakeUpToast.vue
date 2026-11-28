<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { CheckInMakeUpToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInMakeUpToast' })

  defineProps<CheckInMakeUpToastProps>()
  const { t } = useLocaleText()
</script>

<template>
  <Stack gap="none" class="min-w-64 gap-0.5">
    <Text as="p" size="sm" weight="semibold">{{ t('inbox.checkIn.madeUp', { date }) }}</Text>
    <Inline gap="none" align="center" :wrap="false" class="gap-1">
      <Text as="span" size="xs" tone="muted">{{ t('inbox.checkIn.spent') }}</Text>
      <template v-if="method === 'card'">
        <MakeUpCard class="h-3.5" aria-hidden="true" />
        <Text as="span" size="xs" weight="medium">{{ t('inbox.checkIn.card') }}</Text>
      </template>
      <template v-else>
        <HikariPoint class="size-3.5" aria-hidden="true" />
        <Text as="span" size="xs" weight="medium">{{ cost }}</Text>
      </template>
    </Inline>
  </Stack>
</template>
