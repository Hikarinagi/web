<script setup lang="ts">
  import { Button, Chip, Inline } from '@hina-ui/vue'
  import { BROWSE_FILTER_RECALL_KEY } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseChipsBar' })

  const filter = inject(BROWSE_FILTER_RECALL_KEY)
  const chips = computed(() => filter?.chips.value ?? [])
  const count = computed(() => filter?.count.value ?? 0)
</script>

<template>
  <Inline v-if="chips.length" gap="sm">
    <Chip v-for="chip in chips" :key="chip.key" removable @remove="chip.remove()">
      {{ chip.label }}
    </Chip>
    <Button variant="ghost" tone="neutral" size="sm" @click="filter?.clear()">
      清空 ({{ count }})
    </Button>
  </Inline>
</template>
