<script setup lang="ts">
  import { Tag, Text } from '@hina-ui/vue'
  import { ArrowDown, ArrowUp, Minus } from '@lucide/vue'

  defineOptions({ name: 'RankingChange' })
  const props = defineProps<{ rank: number; previous: number | null }>()

  const moved = computed(() => (props.previous === null ? null : props.previous - props.rank))
</script>

<template>
  <Tag v-if="moved === null" v-tooltip="'上一期未上榜'" size="sm" tone="accent">新</Tag>
  <Text
    v-else-if="moved > 0"
    v-tooltip="`比上一期上升 ${moved} 位`"
    as="span"
    size="xs"
    weight="medium"
    tone="success"
    class="inline-flex items-center tabular-nums"
  >
    <ArrowUp class="size-3.5" aria-hidden="true" />
    {{ moved }}
  </Text>
  <Text
    v-else-if="moved < 0"
    v-tooltip="`比上一期下降 ${-moved} 位`"
    as="span"
    size="xs"
    weight="medium"
    tone="faint"
    class="inline-flex items-center tabular-nums"
  >
    <ArrowDown class="size-3.5" aria-hidden="true" />
    {{ -moved }}
  </Text>
  <Text
    v-else
    v-tooltip="'名次与上一期相同'"
    as="span"
    tone="faint"
    class="inline-flex items-center"
    aria-label="名次与上一期相同"
  >
    <Minus class="size-3.5" aria-hidden="true" />
  </Text>
</template>
