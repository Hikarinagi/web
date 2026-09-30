<script setup lang="ts" generic="T">
  import { Button, Empty, Grid, Heading, Inline, SearchInput, Stack } from '@hina-ui/vue'
  import { RefreshCw } from '@lucide/vue'

  const props = defineProps<{
    items: T[]
    itemKey: (item: T) => string | number
    placeholder: string
    emptyText: string
    loading: boolean
    title?: string
  }>()
  defineSlots<{ item(props: { item: T }): unknown }>()
  const search = defineModel<string>('search', { required: true })

  const BATCH = 12
  const batch = ref(0)
  const searching = computed(() => !!search.value.trim())
  const batches = computed(() => Math.ceil(props.items.length / BATCH))
  const shown = computed(() =>
    searching.value
      ? props.items
      : props.items.slice(batch.value * BATCH, (batch.value + 1) * BATCH),
  )

  watch(
    () => props.items,
    () => {
      if (!searching.value) batch.value = 0
    },
  )
</script>

<template>
  <Stack gap="md" class="@container">
    <Heading v-if="title" :level="3">{{ title }}</Heading>
    <Inline align="center" justify="between" gap="sm" :wrap="false">
      <SearchInput
        v-model="search"
        size="sm"
        :placeholder="placeholder"
        :aria-label="placeholder"
        :loading="searching && loading"
        class="w-full max-w-xs"
      />
      <Button
        v-if="!searching && batches > 1"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="shrink-0"
        @click="batch = (batch + 1) % batches"
      >
        <RefreshCw />
        换一批
      </Button>
    </Inline>
    <Grid v-if="shown.length" :cols="3" class="gap-3 @lg:grid-cols-4 @3xl:grid-cols-6">
      <template v-for="item in shown" :key="itemKey(item)">
        <slot name="item" :item="item" />
      </template>
    </Grid>
    <Empty v-else-if="!(searching && loading)" :title="emptyText" size="sm" />
  </Stack>
</template>
