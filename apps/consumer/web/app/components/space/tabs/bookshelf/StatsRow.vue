<script setup lang="ts">
  import { Card, Inline, ScrollArea, Statistic } from '@hina-ui/vue'

  defineOptions({ name: 'SpaceTabsBookshelfStatsRow' })

  defineProps<{ cells: { value: string; unit: string; label: string }[] }>()
</script>

<template>
  <Card :padded="false">
    <ScrollArea axis="x" wheel-to-horizontal>
      <Inline gap="none" align="stretch" :wrap="false" class="min-w-max divide-x divide-line py-4">
        <Statistic
          v-for="cell in cells"
          :key="cell.label"
          :label="cell.label"
          :value="cell.value"
          :suffix="cell.unit || undefined"
          class="min-w-28 flex-1 shrink-0 px-4"
        />
      </Inline>
    </ScrollArea>
  </Card>
</template>
