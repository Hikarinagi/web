<script setup lang="ts">
  import { Button, Grid, IconButton, Inline, Popover, Ripple, Stack, Text } from '@hina-ui/vue'
  import { ChevronLeft, ChevronRight } from '@lucide/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { shiftMonth } from '~/features/galgame/calendar'

  type Calendar = GalgamesCalendarPageData['calendar']

  defineOptions({ name: 'GalgameCalendarSwitcher' })
  const props = defineProps<{ calendar: Calendar; month: string }>()
  const emit = defineEmits<{ update: [month: string] }>()

  const open = ref(false)
  const year = computed(() => Number(props.month.slice(0, 4)))
  const current = computed(() => props.calendar.today.slice(0, 7))
  const cells = computed(() => {
    const counts = new Map(props.calendar.months.map(row => [row.month, row.count]))
    return Array.from({ length: 12 }, (_, index) => {
      const value = `${year.value}-${String(index + 1).padStart(2, '0')}`
      return { value, label: `${index + 1} 月`, count: counts.get(value) ?? 0 }
    })
  })

  function choose(next: string) {
    open.value = false
    emit('update', next)
  }
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false">
    <IconButton
      label="上个月"
      variant="outline"
      tone="neutral"
      pill
      :disabled="month <= `${calendar.first_year}-01`"
      @click="emit('update', shiftMonth(month, -1))"
    >
      <ChevronLeft />
    </IconButton>
    <Popover v-model:open="open">
      <Stack
        as="button"
        type="button"
        gap="none"
        align="center"
        aria-label="选择月份"
        class="hn-state-layer relative isolate w-24 hn-interactive rounded-lg py-1"
      >
        <Ripple />
        <Text as="span" size="sm" tone="muted" class="font-mono leading-tight tabular-nums">
          {{ year }}
        </Text>
        <Text as="span" weight="semibold" class="text-2xl leading-tight tabular-nums">
          {{ Number(month.slice(5)) }} 月
        </Text>
      </Stack>
      <template #content>
        <Stack gap="md" class="w-72">
          <Inline align="center" justify="between" :wrap="false">
            <IconButton
              label="上一年"
              size="sm"
              variant="ghost"
              tone="neutral"
              :disabled="year <= calendar.first_year"
              @click="emit('update', `${year - 1}${month.slice(4)}`)"
            >
              <ChevronLeft />
            </IconButton>
            <Text weight="semibold" class="tabular-nums">{{ year }} 年</Text>
            <IconButton
              label="下一年"
              size="sm"
              variant="ghost"
              tone="neutral"
              :disabled="year >= calendar.last_year"
              @click="emit('update', `${year + 1}${month.slice(4)}`)"
            >
              <ChevronRight />
            </IconButton>
          </Inline>
          <Grid :cols="4" gap="xs">
            <Stack
              v-for="cell in cells"
              :key="cell.value"
              as="button"
              type="button"
              gap="none"
              align="center"
              :aria-pressed="cell.value === month"
              :class="
                cn(
                  'hn-state-layer relative isolate hn-interactive rounded-md py-1.5',
                  cell.value === month && 'bg-accent-soft text-accent-text',
                )
              "
              @click="choose(cell.value)"
            >
              <Ripple />
              <Text as="span" size="sm" weight="semibold" class="tabular-nums">
                {{ cell.label }}
              </Text>
              <Text as="span" size="xs" tone="muted" class="h-4 tabular-nums">
                {{ cell.count ? `${cell.count} 部` : '' }}
              </Text>
            </Stack>
          </Grid>
          <Button
            v-if="month !== current"
            variant="soft"
            tone="neutral"
            size="sm"
            @click="choose(current)"
          >
            回到本月
          </Button>
        </Stack>
      </template>
    </Popover>
    <IconButton
      label="下个月"
      variant="outline"
      tone="neutral"
      pill
      :disabled="month >= `${calendar.last_year}-12`"
      @click="emit('update', shiftMonth(month, 1))"
    >
      <ChevronRight />
    </IconButton>
  </Inline>
</template>
