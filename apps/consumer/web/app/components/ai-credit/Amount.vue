<script setup lang="ts">
  import { enUS, HoverCard, NumberFormat, provideUiLocale, Text } from '@hina-ui/vue'

  defineOptions({ inheritAttrs: false })
  withDefaults(defineProps<{ balance: number; free?: number }>(), { free: 0 })

  provideUiLocale(enUS)
</script>

<template>
  <HoverCard align="start" :padded="false">
    <NumberFormat
      v-bind="$attrs"
      :value="balance + free"
      format="compact"
      title=""
      class="w-fit tabular-nums"
    />
    <template #content>
      <Text size="sm" class="px-3 py-1.5 tabular-nums">
        <NumberFormat :value="balance" />
        <template v-if="free > 0">
          + <NumberFormat :value="free" class="text-accent-text" />
        </template>
      </Text>
    </template>
  </HoverCard>
</template>
