<script setup lang="ts">
  import { Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import type { GalgameComparisonPageData } from '~~/server/api/pages/galgames/[id]/revisions/compare.get'
  import { factText, importSourceText, titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameHistoryComparisonEntry' })
  type Entry = GalgameComparisonPageData['comparison']['entries'][number]
  type Property = Entry['properties'][number]['property']
  type Value = Entry['properties'][number]['before'][number]

  defineProps<{ entry: Entry }>()

  const note = (value: Value) => {
    const citation = value.citations.find(item => item.kind === 'first_hand') ?? value.citations[0]
    if (!citation) return ''
    if (citation.kind === 'first_hand') return citation.source ?? ''
    if (citation.imported_from.length) return `从 ${importSourceText(citation.imported_from)} 导入`
    return citation.member ? '成员录入' : (citation.source ?? '')
  }
  const items = (property: Property, values: Value[], other: Value[]) => {
    const keys = new Set(other.map(value => `${factText(property, value)}|${note(value)}`))
    return values.map(value => ({
      text: factText(property, value),
      note: note(value),
      changed: !keys.has(`${factText(property, value)}|${note(value)}`),
    }))
  }
</script>

<template>
  <Stack gap="none" class="border-b border-line last:border-b-0">
    <Text size="sm" weight="medium" class="px-4 pt-3 pb-1">{{ titleText(entry.title) }}</Text>
    <Grid
      v-for="change in entry.properties"
      :key="change.property"
      :cols="2"
      gap="none"
      class="divide-x divide-line text-sm"
    >
      <Inline
        v-for="(side, index) in [
          items(change.property, change.before, change.after),
          items(change.property, change.after, change.before),
        ]"
        :key="index"
        gap="md"
        align="start"
        :wrap="false"
        class="px-4 py-2"
      >
        <Text as="span" size="sm" tone="muted" class="w-20 shrink-0">
          {{ change.label }}
        </Text>
        <Stack gap="xs" class="min-w-0">
          <Text v-if="!side.length" as="span" tone="faint">—</Text>
          <Inline v-for="(item, itemIndex) in side" :key="itemIndex" gap="sm" align="baseline">
            <Text
              as="span"
              size="sm"
              :class="
                item.changed
                  ? index
                    ? 'rounded-xs bg-success-soft px-1 text-success-text'
                    : 'rounded-xs bg-danger-soft px-1 text-danger-text line-through'
                  : undefined
              "
            >
              {{ item.text }}
            </Text>
            <Text v-if="item.note" as="span" size="xs" tone="muted">{{ item.note }}</Text>
          </Inline>
        </Stack>
      </Inline>
    </Grid>
  </Stack>
</template>
