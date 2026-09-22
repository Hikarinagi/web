<script setup lang="ts">
  import { Indicator, Inline, Stack, Text } from '@hina-ui/vue'
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinMakeUpBar' })

  const props = defineProps<{ status: CheckInStatus | null }>()
  const makeUp = computed(() => props.status?.make_up ?? null)
</script>

<template>
  <Stack gap="sm">
    <Inline gap="md" class="gap-y-1">
      <Inline gap="xs" as="span">
        <Indicator class="size-3 bg-accent/20" />
        <Text as="span" size="xs" tone="muted">已签到</Text>
      </Inline>
      <Inline gap="xs" as="span">
        <Indicator class="size-3 bg-warning/30" />
        <Text as="span" size="xs" tone="muted">补签</Text>
      </Inline>
      <Inline gap="xs" as="span">
        <Indicator class="size-3 border border-dashed border-line-strong bg-transparent" />
        <Text as="span" size="xs" tone="muted">漏签</Text>
      </Inline>
    </Inline>

    <Stack v-if="makeUp" gap="none" class="divide-y divide-line rounded-lg bg-subtle px-4">
      <Inline justify="between" class="py-2.5">
        <Text as="span" size="sm">本月补签 {{ makeUp.used }} / {{ makeUp.limit }} 次</Text>
        <Text
          v-if="makeUp.remaining > 0"
          as="span"
          size="sm"
          tone="muted"
          class="inline-flex items-center gap-1"
        >
          下次消耗 {{ makeUp.next_cost }}
          <HikariPoint class="size-3.5" aria-hidden="true" />
        </Text>
        <Text v-else as="span" size="sm" tone="muted">本月配额已用尽</Text>
      </Inline>
      <Inline justify="between" class="py-2.5">
        <Inline gap="xs" as="span">
          <MakeUpCard class="h-5" aria-hidden="true" />
          <Text as="span" size="sm">补签卡 × {{ makeUp.card.available }}</Text>
        </Inline>
        <Text as="span" size="sm" tone="muted" class="inline-flex items-center gap-1">
          本月已购买 {{ makeUp.card.purchased }} / {{ makeUp.card.purchase_limit }} 张
        </Text>
      </Inline>
    </Stack>

    <Text v-if="makeUp" size="xs" tone="muted">
      点击日历中的漏签日即可补签。本月配额用尽或补签更早的日期时需消耗补签卡，可补签最近
      {{ makeUp.window_days }} 天内的漏签日。
    </Text>
  </Stack>
</template>
