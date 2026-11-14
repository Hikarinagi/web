<script setup lang="ts">
  import { Grid, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'

  defineOptions({ name: 'GalgameCalendarDay' })
  defineProps<{
    id?: string
    title: string
    note: string
    label: string
    today?: boolean
    items: GalgamesCalendarPageData['calendar']['items']
  }>()
</script>

<template>
  <Inline
    :id="id"
    as="section"
    gap="md"
    align="start"
    :wrap="false"
    class="scroll-mt-(--sticky-top)"
  >
    <Stack gap="xs" class="sticky top-(--sticky-top) w-16 shrink-0 pt-2.5">
      <Heading
        :level="2"
        :aria-label="label"
        :class="
          cn('text-2xl leading-none whitespace-nowrap tabular-nums', today && 'text-accent-text')
        "
      >
        {{ title }}
      </Heading>
      <Text size="xs" tone="muted">{{ note }}</Text>
      <Tag v-if="today" tone="accent" size="sm" class="self-start">今天</Tag>
      <Text v-else-if="items.length > 1" size="xs" tone="faint" class="tabular-nums">
        {{ items.length }} 部
      </Text>
    </Stack>
    <Grid :cols="1" gap="none" class="min-w-0 flex-1 gap-x-6 xl:grid-cols-2">
      <GalgameCalendarItem v-for="item in items" :key="item.id" :item="item" />
    </Grid>
  </Inline>
</template>
