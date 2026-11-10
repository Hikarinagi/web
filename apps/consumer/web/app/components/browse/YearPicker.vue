<script setup lang="ts">
  import { Button, Chip, Inline, NumberInput, Stack, Text } from '@hina-ui/vue'
  import {
    BROWSE_DECADES,
    FIRST_YEAR,
    LAST_YEAR,
    cleanYears,
    rangeText,
    span,
    yearRanges,
    type YearRange,
  } from '~/features/browse/years'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'BrowseYearPicker' })
  const props = defineProps<{
    histogram: { year: number; count: number }[]
    years: number[]
    instant?: boolean
  }>()
  const emit = defineEmits<{ apply: [years: number[]] }>()

  const chosen = ref<number[]>([...props.years])
  watch(
    () => props.years,
    value => (chosen.value = [...value]),
  )
  const picked = computed(() => new Set(chosen.value))
  const ranges = computed(() => yearRanges(chosen.value))
  const bars = computed(() => {
    const counts = new Map(props.histogram.map(bar => [bar.year, bar.count]))
    const years = props.histogram.map(bar => bar.year).filter(year => year >= 1980)
    if (!years.length) return []
    return span(Math.min(...years), Math.max(...years)).map(year => ({
      year,
      count: counts.get(year) ?? 0,
    }))
  })
  const peak = computed(() => Math.max(1, ...bars.value.map(bar => bar.count)))
  const latest = computed(() => bars.value.at(-1)?.year ?? new Date().getFullYear())
  const track = useTemplateRef<HTMLElement>('track')
  const hover = ref<number | null>(null)
  const start = ref<number | null>(null)
  const end = ref<number | null>(null)
  let drag: { anchor: number; adding: boolean; base: number[] } | null = null
  const plain = { useGrouping: false }

  function commit(next: number[]) {
    chosen.value = cleanYears(next)
    if (props.instant && !drag) emit('apply', chosen.value)
  }
  function yearAt(event: PointerEvent) {
    const rect = track.value?.getBoundingClientRect()
    if (!rect || !bars.value.length) return null
    const index = Math.floor(((event.clientX - rect.left) / rect.width) * bars.value.length)
    return bars.value[Math.min(bars.value.length - 1, Math.max(0, index))]!.year
  }
  function paint(to: number) {
    if (!drag) return
    const next = new Set(drag.base)
    for (const year of span(Math.min(drag.anchor, to), Math.max(drag.anchor, to)))
      if (drag.adding) next.add(year)
      else next.delete(year)
    chosen.value = cleanYears([...next])
  }
  function down(event: PointerEvent) {
    const year = yearAt(event)
    if (year === null) return
    track.value?.setPointerCapture(event.pointerId)
    drag = { anchor: year, adding: !picked.value.has(year), base: [...chosen.value] }
    paint(year)
  }
  function move(event: PointerEvent) {
    const year = yearAt(event)
    hover.value = year
    if (drag && year !== null) paint(year)
  }
  function up() {
    if (!drag) return
    drag = null
    commit(chosen.value)
  }
  function remove(range: YearRange) {
    commit(chosen.value.filter(year => year < range.from || year > range.to))
  }
  function add() {
    const from = Math.max(
      FIRST_YEAR,
      Math.min(start.value ?? FIRST_YEAR, end.value ?? latest.value),
    )
    const to = Math.min(LAST_YEAR, Math.max(start.value ?? FIRST_YEAR, end.value ?? latest.value))
    start.value = null
    end.value = null
    commit([...chosen.value, ...span(from, to)])
  }
  const decadeOn = (decade: YearRange) =>
    span(decade.from, decade.to).every(year => picked.value.has(year))
  function toggleDecade(decade: YearRange) {
    const years = new Set(span(decade.from, decade.to))
    commit(
      decadeOn(decade)
        ? chosen.value.filter(year => !years.has(year))
        : [...chosen.value, ...years],
    )
  }
  function tone(year: number) {
    if (picked.value.has(year) || (!picked.value.size && hover.value === year)) return 'bg-accent'
    if (!picked.value.size || hover.value === year) return 'bg-accent/60'
    return 'bg-line-strong'
  }
  const hoverIndex = computed(() =>
    hover.value === null ? -1 : bars.value.findIndex(bar => bar.year === hover.value),
  )
  const hoverAlign = computed(() => {
    const index = hoverIndex.value
    if (index < 2) return { align: 'justify-start', from: index, to: index + 4 }
    if (index > bars.value.length - 3) return { align: 'justify-end', from: index - 4, to: index }
    return { align: 'justify-center', from: index - 2, to: index + 2 }
  })
  function label(year: number, index: number) {
    if (index === hoverIndex.value) return hoverAlign.value.align
    if (year % 10 !== 0) return 'invisible'
    if (hoverIndex.value < 0) return 'justify-start'
    const { from, to } = hoverAlign.value
    return index > to + 1 || index + 4 < from - 1 ? 'justify-start' : 'invisible'
  }
</script>

<template>
  <Stack gap="md" class="w-96 max-w-full">
    <Stack v-if="bars.length" gap="xs">
      <div
        ref="track"
        class="flex h-16 cursor-pointer touch-none items-end gap-px select-none"
        @pointerdown="down"
        @pointermove="move"
        @pointerup="up"
        @pointercancel="up"
        @pointerleave="hover = null"
      >
        <div
          v-for="bar in bars"
          :key="bar.year"
          class="min-w-0 flex-1 rounded-t-sm transition-colors"
          :class="tone(bar.year)"
          :style="{ height: bar.count ? `${Math.max(4, (bar.count / peak) * 100)}%` : '0' }"
        />
      </div>
      <Inline gap="none" :wrap="false" class="gap-px">
        <Text
          v-for="(bar, index) in bars"
          :key="bar.year"
          as="span"
          size="xs"
          :tone="bar.year === hover ? 'default' : 'faint'"
          :class="cn('flex min-w-0 flex-1 whitespace-nowrap tabular-nums', label(bar.year, index))"
        >
          {{ bar.year }}
        </Text>
      </Inline>
    </Stack>
    <Inline gap="sm" align="center">
      <Chip v-for="range in ranges" :key="range.from" removable @remove="remove(range)">
        {{ rangeText(range) }}
      </Chip>
      <Text v-if="!ranges.length" size="sm" tone="muted">全部年份</Text>
    </Inline>
    <Inline gap="sm" align="center" :wrap="false">
      <NumberInput
        v-model="start"
        :min="FIRST_YEAR"
        :max="LAST_YEAR"
        :controls="false"
        :format-options="plain"
        placeholder="开始年"
        aria-label="开始年"
        class="w-24"
      />
      <Text size="sm" tone="muted">至</Text>
      <NumberInput
        v-model="end"
        :min="FIRST_YEAR"
        :max="LAST_YEAR"
        :controls="false"
        :format-options="plain"
        placeholder="结束年"
        aria-label="结束年"
        class="w-24"
      />
      <Button variant="outline" tone="neutral" :disabled="!start && !end" @click="add">添加</Button>
    </Inline>
    <Inline gap="sm">
      <Chip
        v-for="decade in BROWSE_DECADES"
        :key="decade.label"
        selectable
        :selected="decadeOn(decade)"
        @update:selected="toggleDecade(decade)"
      >
        {{ decade.label }}
      </Chip>
    </Inline>
    <Inline v-if="!instant" gap="sm" justify="end">
      <Button variant="ghost" tone="neutral" size="sm" @click="emit('apply', [])">清除</Button>
      <Button size="sm" @click="emit('apply', chosen)">确定</Button>
    </Inline>
  </Stack>
</template>
