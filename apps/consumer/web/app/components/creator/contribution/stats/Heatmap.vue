<script setup lang="ts">
  import { Flex, Inline, Panel, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import { CalendarRange } from '@lucide/vue'
  import type { BackendContributionStats } from '~/features/creator/contribution'
  import {
    HEATMAP_DIMENSIONS as D,
    HEATMAP_LEVEL_CLASSES as LEVELS,
    HEATMAP_WEEK_LABELS as WEEK_LABELS,
    heatmapTooltip,
    useContributionHeatmap,
  } from '~/features/creator/composables/useContributionHeatmap'

  const props = defineProps<{ stats: BackendContributionStats }>()
  const { grid, monthHeaders } = useContributionHeatmap(() => props.stats)
</script>

<template>
  <Panel title="贡献日历" :description="`过去 1 年共 ${stats.range.count} 次贡献`">
    <template #icon><CalendarRange /></template>
    <Stack gap="sm" class="select-none" :style="{ maxWidth: `${D.width}px` }">
      <ScrollArea class="min-w-0">
        <Flex
          class="relative"
          :style="{ width: `${D.width}px`, height: `${D.height}px` }"
          role="img"
          aria-label="贡献日历"
        >
          <Text
            v-for="header in monthHeaders"
            :key="`m-${header.col}`"
            as="span"
            tone="muted"
            class="absolute leading-none"
            :style="{
              left: `${D.weekLabelW + header.col * D.step}px`,
              top: '0px',
              fontSize: `${D.labelFont}px`,
            }"
          >
            {{ header.label }}
          </Text>
          <template v-for="(label, row) in WEEK_LABELS" :key="`w-${row}`">
            <Text
              v-if="label"
              as="span"
              tone="muted"
              class="absolute leading-none"
              :style="{
                left: '0px',
                top: `${D.monthLabelH + row * D.step + (D.cell - D.labelFont) / 2}px`,
                fontSize: `${D.labelFont}px`,
              }"
            >
              {{ label }}
            </Text>
          </template>
          <template v-for="(col, c) in grid" :key="`c-${c}`">
            <Flex
              v-for="(cell, r) in col.cells"
              v-show="!cell.future"
              :key="`${c}-${r}`"
              v-tooltip="heatmapTooltip(cell)"
              as="span"
              :class="cn('absolute rounded-xs', LEVELS[cell.level])"
              :style="{
                left: `${D.weekLabelW + c * D.step}px`,
                top: `${D.monthLabelH + r * D.step}px`,
                width: `${D.cell}px`,
                height: `${D.cell}px`,
              }"
            />
          </template>
        </Flex>
      </ScrollArea>

      <Inline gap="md" align="center" justify="between" class="text-xs">
        <Inline gap="xs" align="center" class="text-muted">
          <Text as="span" size="xs">少</Text>
          <Flex
            v-for="(palette, level) in LEVELS"
            :key="level"
            as="span"
            :class="cn('size-2.5 rounded-xs', palette)"
          />
          <Text as="span" size="xs">多</Text>
        </Inline>
        <Text size="xs" tone="muted">
          已合并
          <Text as="strong" size="xs" weight="semibold">{{ stats.totals.merged }}</Text>
          <Text as="span" size="xs" tone="faint" class="mx-2">·</Text>
          待审
          <Text as="strong" size="xs" weight="semibold">{{ stats.totals.pending }}</Text>
          <Text as="span" size="xs" tone="faint" class="mx-2">·</Text>
          已关闭
          <Text as="strong" size="xs" weight="semibold">{{ stats.totals.closed }}</Text>
        </Text>
      </Inline>
    </Stack>
  </Panel>
</template>
