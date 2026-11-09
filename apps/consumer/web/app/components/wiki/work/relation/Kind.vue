<script setup lang="ts">
  import { IconButton, Inline, Select, Text } from '@hina-ui/vue'
  import { ArrowLeftRight } from '@lucide/vue'
  import type { RelationRow } from '~/features/wiki/editor/relations'
  import { codeLabel, relationLead } from '~/features/wiki/values'

  defineOptions({ name: 'WikiWorkRelationKind' })

  const props = defineProps<{ row: RelationRow; options: { value: string; label: string }[] }>()
  const emit = defineEmits<{ kind: [code: string]; flip: [] }>()
  const lead = computed(() => relationLead(props.row.code, props.row.side))
</script>

<template>
  <Text v-if="row.state === 'removed'" size="sm" class="whitespace-nowrap line-through">
    {{ lead }}{{ row.code ? codeLabel('GAME_RELATION', row.code) : '' }}
  </Text>
  <Inline v-else gap="sm" align="center" :wrap="false">
    <Text size="sm" class="w-20 shrink-0">{{ lead }}</Text>
    <Select
      :model-value="row.code"
      :options="options"
      aria-label="关系"
      class="w-28"
      @update:model-value="value => value && emit('kind', String(value))"
    />
    <IconButton
      label="对调"
      variant="ghost"
      tone="neutral"
      size="sm"
      :disabled="row.code === 'SAME_SERIES'"
      @click="emit('flip')"
    >
      <ArrowLeftRight />
    </IconButton>
  </Inline>
</template>
