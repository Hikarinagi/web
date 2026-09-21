<script setup lang="ts">
  import { Button, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceSidebarCheckIn' })

  const props = defineProps<{ status: NonNullable<SpacePageData['status']> }>()

  const checkin = useCheckin()
  const points = computed(() => checkin.status.value?.points ?? props.status.hikari_point)
  const checkedIn = computed(
    () => checkin.status.value?.checked_in_today ?? props.status.checked_in_today,
  )
  const longest = computed(
    () => checkin.status.value?.longest_streak ?? props.status.longest_check_in_streak,
  )
  const streak = computed(() => checkin.status.value?.streak ?? null)
</script>

<template>
  <Panel title="签到" :padded="false">
    <Stack gap="sm" class="px-(--hn-panel-p) pb-(--hn-panel-p)">
      <Inline gap="sm" align="end" justify="between" :wrap="false">
        <Inline as="span" gap="xs" align="baseline">
          <HikariPoint class="size-5 self-center" aria-hidden="true" />
          <Text as="span" size="2xl" weight="semibold">{{ points }}</Text>
          <Text as="span" size="xs" tone="muted">光点</Text>
        </Inline>
        <Button
          size="sm"
          :variant="checkedIn ? 'soft' : 'solid'"
          :tone="checkedIn ? 'neutral' : 'accent'"
          class="shrink-0"
          @click="checkin.open()"
        >
          {{ checkedIn ? '签到日历' : '去签到' }}
        </Button>
      </Inline>
      <Text size="xs" tone="muted">
        <template v-if="streak !== null">当前连续签到 {{ streak }} 天 ·</template>
        历史最长连续签到 {{ longest }} 天
      </Text>
    </Stack>
  </Panel>
</template>
