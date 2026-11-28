<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { CheckInRewardToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInRewardToast' })

  defineProps<CheckInRewardToastProps>()
  const { t } = useLocaleText()
</script>

<template>
  <Stack gap="none" class="min-w-64 gap-0.5">
    <Text as="p" size="sm" weight="semibold">{{ t('inbox.checkIn.done', { date }) }}</Text>

    <Inline gap="none" align="center" :wrap="false" class="gap-1">
      <Text as="span" size="xs" tone="muted">{{ t('inbox.checkIn.gained') }}</Text>
      <HikariPoint class="size-3.5" aria-hidden="true" />
      <Text as="span" size="xs" weight="medium">{{ points }}</Text>
    </Inline>

    <Inline v-if="milestone" gap="none" align="center" :wrap="false" class="gap-1">
      <Text as="span" size="xs" weight="medium" tone="accent">
        {{ t('inbox.checkIn.streak', { days: milestone.days }) }}
      </Text>
      <Text as="span" size="xs" weight="medium" tone="accent">+{{ milestone.bonus }}</Text>
      <HikariPoint class="size-3.5" aria-hidden="true" />
    </Inline>
  </Stack>
</template>
