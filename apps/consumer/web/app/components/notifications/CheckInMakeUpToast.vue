<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import type { NotivueItem } from 'notivue'
  import type { CheckInMakeUpToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInMakeUpToast' })

  const props = defineProps<{ item: NotivueItem }>()

  const data = computed(() => props.item.props as Partial<CheckInMakeUpToastProps>)
  const cost = computed(() => (typeof data.value.cost === 'number' ? data.value.cost : 0))
  const date = computed(() => data.value.date ?? '')
</script>

<template>
  <Card :padded="false" class="hn-scrollbar-safe min-w-72 p-3 shadow-lg">
    <Stack gap="none" class="gap-0.5">
      <Text as="p" size="sm" weight="semibold">补签成功 · {{ date }}</Text>
      <Inline gap="none" align="center" :wrap="false" class="gap-1 text-xs text-muted">
        <Text as="span" size="xs">消耗</Text>
        <HikariPoint class="size-3.5" aria-hidden="true" />
        <Text as="span" size="xs" weight="medium" class="text-fg">{{ cost }}</Text>
      </Inline>
    </Stack>
  </Card>
</template>
