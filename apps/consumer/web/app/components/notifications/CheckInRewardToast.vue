<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import type { NotivueItem } from 'notivue'
  import type { CheckInRewardToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInRewardToast' })

  const props = defineProps<{ item: NotivueItem }>()

  const reward = computed(() => props.item.props as Partial<CheckInRewardToastProps>)
  const date = computed(() => reward.value.date ?? '')
  const points = computed(() => (typeof reward.value.points === 'number' ? reward.value.points : 0))
  const milestone = computed(() => reward.value.milestone ?? null)
</script>

<template>
  <Card :padded="false" class="hn-scrollbar-safe min-w-72 rounded-md p-3 shadow-lg">
    <Stack gap="none" class="gap-0.5">
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
  </Card>
</template>
