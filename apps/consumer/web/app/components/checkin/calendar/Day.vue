<script setup lang="ts">
  import { Button, Center, Popconfirm } from '@hina-ui/vue'
  import type { CheckInCell, CheckInCellState } from '~/features/checkin/calendar'
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinCalendarDay' })

  const props = defineProps<{ cell: CheckInCell; status: CheckInStatus | null }>()
  const emit = defineEmits<{ makeUp: [string, 'points' | 'card']; purchase: [string] }>()

  const CELL_CLASS: Record<CheckInCellState, string> = {
    signed: 'bg-accent/10 font-semibold text-accent-text',
    'make-up': 'bg-warning-soft font-semibold text-warning-text',
    today: 'ring-accent font-semibold ring-2',
    missed: '',
    expired: 'text-disabled line-through decoration-2 decoration-current',
    future: 'text-disabled',
    normal: 'text-muted',
    other: 'text-disabled opacity-60',
  }

  const method = computed(() => props.cell.method ?? 'points')

  const dayClass = computed(() =>
    cn(
      'size-9 border border-dashed text-sm',
      props.cell.method === 'card' ? 'border-warning/60 text-warning-text' : 'border-line-strong',
    ),
  )

  const needsPurchase = computed(
    () => props.cell.method === 'card' && (props.status?.make_up.card.available ?? 0) === 0,
  )

  const hint = computed(() => {
    const makeUp = props.status?.make_up
    if (!makeUp) return ''
    if (props.cell.method === 'points') {
      return `补签 ${props.cell.key}，将消耗 ${makeUp.next_cost} 光点。本月剩余补签次数 ${makeUp.remaining} 次。`
    }
    return `补签 ${props.cell.key}，将消耗 1 张补签卡。当前持有 ${makeUp.card.available} 张。`
  })

  const expiredHint = computed(
    () => `超出可补签范围，仅可补签最近 ${props.status?.make_up.window_days ?? 0} 天内的漏签日`,
  )
</script>

<template>
  <Center class="py-0.5">
    <Popconfirm
      v-if="cell.state === 'missed' && !needsPurchase"
      title="补签"
      :description="hint"
      confirm-text="补签"
      @confirm="emit('makeUp', cell.key, method)"
    >
      <Button
        variant="ghost"
        tone="neutral"
        pill
        :class="dayClass"
        :aria-label="`补签 ${cell.key}`"
      >
        {{ cell.day }}
      </Button>
    </Popconfirm>

    <Button
      v-else-if="cell.state === 'missed'"
      variant="ghost"
      tone="neutral"
      pill
      :class="dayClass"
      :aria-label="`使用补签卡补签 ${cell.key}`"
      @click="emit('purchase', cell.key)"
    >
      {{ cell.day }}
    </Button>

    <Center
      v-else-if="cell.state === 'expired'"
      v-tooltip="expiredHint"
      as="span"
      class="size-9 rounded-full text-sm"
      :class="CELL_CLASS.expired"
    >
      {{ cell.day }}
    </Center>

    <Center v-else as="span" class="size-9 rounded-full text-sm" :class="CELL_CLASS[cell.state]">
      {{ cell.day }}
    </Center>
  </Center>
</template>
