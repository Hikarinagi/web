<script setup lang="ts">
  import {
    Button,
    Card,
    Chip,
    Grid,
    Inline,
    MultiCombobox,
    RangeSlider,
    SegmentedControl,
    Select,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import type { GalgameHistogram } from '~/features/galgame/explore'
  import { useReleaseTimeline } from '~/features/galgame/useReleaseTimeline'

  defineOptions({ name: 'GalgameBrowseTimeline' })
  const props = defineProps<{
    histogram: GalgameHistogram
    releaseFrom?: string
    releasePeriods: string[]
    releaseTo?: string
  }>()
  const emit = defineEmits<{
    update: [value: { release_from?: string; release_periods?: string[]; release_to?: string }]
  }>()
  const {
    changeFromMonth,
    changeFromYear,
    changeMode,
    changePeriods,
    changeToMonth,
    changeToYear,
    changeYearRange,
    clear,
    hasSelection,
    maxYear,
    minYear,
    mode,
    modeOptions,
    monthOptions,
    periodOptions,
    rangeFromMonth,
    rangeFromYear,
    rangeToMonth,
    rangeToYear,
    rangeYears,
    releasePeriodLabel,
    selectedLabel,
    yearOptions,
  } = useReleaseTimeline(props, emit)
</script>

<template>
  <Card :padded="false" class="flex flex-col gap-4 rounded-xl px-5 py-4 shadow-none">
    <Inline justify="between">
      <Inline gap="sm" :wrap="false">
        <Text size="sm" weight="medium" tone="muted">发售时间</Text>
        <Tag>{{ selectedLabel }}</Tag>
      </Inline>
      <Inline gap="sm" :wrap="false">
        <Button v-if="hasSelection" variant="ghost" tone="neutral" size="sm" @click="clear">
          清除
        </Button>
        <SegmentedControl
          :model-value="mode"
          :options="modeOptions"
          size="sm"
          @update:model-value="changeMode"
        />
      </Inline>
    </Inline>

    <Stack v-if="mode === 'range'" gap="md">
      <Stack gap="sm" class="px-1">
        <Inline justify="between" :wrap="false" class="text-xs text-muted">
          <Text as="span" size="xs" tone="muted">年份跨度</Text>
          <Text as="span" size="xs" tone="muted">
            {{ rangeYears[0] }}年 – {{ rangeYears[1] }}年
          </Text>
        </Inline>
        <RangeSlider
          :model-value="rangeYears"
          :min="minYear"
          :max="maxYear"
          @commit="changeYearRange"
        />
        <Inline justify="between" :wrap="false">
          <Text as="span" size="xs" tone="faint">{{ minYear }}</Text>
          <Text as="span" size="xs" tone="faint">{{ maxYear }}</Text>
        </Inline>
      </Stack>

      <Grid :cols="1" class="gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
        <Inline gap="sm" class="min-w-0">
          <Text as="span" size="xs" weight="medium" tone="muted" class="w-10">开始</Text>
          <Select
            :model-value="rangeFromYear"
            :options="yearOptions"
            size="sm"
            class="w-36"
            @update:model-value="changeFromYear"
          />
          <Select
            :model-value="rangeFromMonth"
            :options="monthOptions"
            size="sm"
            class="w-24"
            @update:model-value="changeFromMonth"
          />
        </Inline>

        <Text as="span" size="xs" tone="faint" class="hidden lg:block">至</Text>

        <Inline gap="sm" class="min-w-0">
          <Text as="span" size="xs" weight="medium" tone="muted" class="w-10">结束</Text>
          <Select
            :model-value="rangeToYear"
            :options="yearOptions"
            size="sm"
            class="w-36"
            @update:model-value="changeToYear"
          />
          <Select
            :model-value="rangeToMonth"
            :options="monthOptions"
            size="sm"
            class="w-24"
            @update:model-value="changeToMonth"
          />
        </Inline>
      </Grid>
    </Stack>

    <Stack v-else gap="md">
      <MultiCombobox
        :model-value="props.releasePeriods"
        :options="periodOptions"
        placeholder="选择年份或月份"
        size="sm"
        class="w-full md:w-lg"
        @update:model-value="changePeriods"
      />

      <Inline v-if="props.releasePeriods.length" gap="sm">
        <Chip v-for="period in props.releasePeriods" :key="period">
          {{ releasePeriodLabel(period) }}
        </Chip>
      </Inline>
    </Stack>
  </Card>
</template>
