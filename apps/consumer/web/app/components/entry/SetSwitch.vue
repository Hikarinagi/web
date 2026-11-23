<script setup lang="ts">
  import { Inline, SegmentedControl, Text } from '@hina-ui/vue'
  import type { VolumeSetOption } from '~/features/volume-set/sets'

  defineOptions({ name: 'EntrySetSwitch' })

  defineProps<{ options: VolumeSetOption[] }>()
  const set = defineModel<number | null>({ required: true })
</script>

<template>
  <SegmentedControl
    v-if="options.length > 1"
    :model-value="set ?? undefined"
    :options="options"
    size="sm"
    aria-label="版本"
    class="max-w-full self-start"
    @update:model-value="set = typeof $event === 'number' ? $event : set"
  />
  <Inline v-else-if="options[0] && !options[0].original" gap="sm" align="baseline">
    <Text as="span" size="sm" tone="muted">版本</Text>
    <Text as="span" size="sm">{{ options[0].label }}</Text>
  </Inline>
</template>
