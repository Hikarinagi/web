<script setup lang="ts">
  import { BROWSE_FILTER_KEY } from '~/features/manga/useBrowseFilter'

  defineOptions({ name: 'MangaBrowseChipsBar' })
  const filter = inject(BROWSE_FILTER_KEY)
  const chips = computed(() => filter?.chips.value ?? [])
  const count = computed(() => filter?.count.value ?? 0)
</script>

<template>
  <div v-if="chips.length" class="flex flex-wrap items-center gap-2">
    <Chip
      v-for="chip in chips"
      :key="chip.key"
      :label="chip.label"
      removable
      @remove="chip.remove()"
    />
    <Button
      :label="`清空标签 (${count})`"
      text
      severity="secondary"
      size="small"
      @click="filter?.clear()"
    />
  </div>
</template>
