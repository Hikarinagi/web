<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { CheckInRewardToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInRewardToast' })

  defineProps<CheckInRewardToastProps>()
</script>

<template>
  <Stack gap="none" class="min-w-64 gap-0.5">
    <Text as="p" size="sm" weight="semibold">签到成功 · {{ date }}</Text>

    <Inline gap="none" align="center" :wrap="false" class="gap-1">
      <Text as="span" size="xs" tone="muted">获得</Text>
      <HikariPoint class="size-3.5" aria-hidden="true" />
      <Text as="span" size="xs" weight="medium">{{ points }}</Text>
    </Inline>

    <Inline v-if="milestone" gap="none" align="center" :wrap="false" class="gap-1">
      <Text as="span" size="xs" weight="medium" tone="accent">
        连续签到{{ milestone.days }}天达成，
      </Text>
      <Text as="span" size="xs" weight="medium" tone="accent">+{{ milestone.bonus }}</Text>
      <HikariPoint class="size-3.5" aria-hidden="true" />
    </Inline>
  </Stack>
</template>
