<script setup lang="ts">
  import { Button, Grid, Stack, Text } from '@hina-ui/vue'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'

  defineOptions({ name: 'GalgameCalendarYear' })
  defineProps<{ month: string; months: GalgamesCalendarPageData['calendar']['months'] }>()
  const emit = defineEmits<{ update: [month: string] }>()
</script>

<template>
  <Stack gap="sm">
    <Text size="sm" weight="medium" class="tabular-nums">
      {{ months[0]?.month.slice(0, 4) }} 年
    </Text>
    <Grid :cols="4" gap="xs">
      <Button
        v-for="entry in months"
        :key="entry.month"
        size="sm"
        :variant="entry.month === month ? 'soft' : 'ghost'"
        :tone="entry.month === month ? 'accent' : 'neutral'"
        :disabled="!entry.count && entry.month !== month"
        :aria-current="entry.month === month ? 'true' : undefined"
        :aria-label="`${Number(entry.month.slice(5))} 月，${entry.count} 部作品发售`"
        class="h-auto min-w-0 px-1 py-1.5"
        @click="emit('update', entry.month)"
      >
        <Stack gap="none" align="center">
          <Text as="span" size="sm" class="text-current">
            {{ Number(entry.month.slice(5)) }} 月
          </Text>
          <Text as="span" size="xs" class="text-current tabular-nums opacity-70">
            {{ entry.count }}
          </Text>
        </Stack>
      </Button>
    </Grid>
  </Stack>
</template>
