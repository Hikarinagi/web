<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton } from '@hina-ui/vue'
  import { Ellipsis } from '@lucide/vue'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import type { ExtraKind, QualifierKind } from '~/features/wiki/editor/inputs'

  defineOptions({ name: 'WikiFieldMenu' })

  const props = defineProps<{
    label: string
    definition: PropertyDefinition
    value: ValueDraft
    shown: QualifierKind[]
    extras: ExtraKind[]
    up: boolean
    down: boolean
    relocatable?: boolean
    fixed?: boolean
    added?: boolean
  }>()
  const emit = defineEmits<{
    qualify: [kind: QualifierKind]
    extra: [kind: ExtraKind]
    unknown: [on: boolean]
    conceal: [on: boolean]
    move: [step: -1 | 1]
    relocate: []
    remove: []
  }>()

  const QUALIFIERS: Record<QualifierKind, string> = {
    version: '指定适用版本',
    period: '指定期间',
    part: '指定适用部分',
    language: '指定语言',
  }
  const qualifiers = computed(() =>
    (props.definition.qualifiers as QualifierKind[]).filter(kind => !props.shown.includes(kind)),
  )
  const extras = computed(() =>
    [
      props.definition.reading ? { kind: 'reading' as const, label: '填写读音' } : null,
      props.definition.shape === 'credit' ? { kind: 'song' as const, label: '填写歌曲' } : null,
      props.definition.archive ? { kind: 'archive' as const, label: '填写存档地址' } : null,
    ].filter(item => item && !props.extras.includes(item.kind)),
  )
  const multiple = computed(() => props.definition.cardinality === 'multiple')
</script>

<template>
  <DropdownMenu align="end">
    <IconButton
      :label="`${label}的更多操作`"
      variant="ghost"
      tone="neutral"
      size="sm"
      class="shrink-0"
    >
      <Ellipsis />
    </IconButton>
    <template #content>
      <DropdownMenuItem v-for="kind in qualifiers" :key="kind" @select="emit('qualify', kind)">
        {{ QUALIFIERS[kind] }}
      </DropdownMenuItem>
      <DropdownMenuItem
        v-for="item in extras"
        :key="item!.kind"
        @select="emit('extra', item!.kind)"
      >
        {{ item!.label }}
      </DropdownMenuItem>
      <DropdownMenuItem
        v-if="definition.shape !== 'image'"
        @select="emit('unknown', value.value_kind !== 'UNKNOWN')"
      >
        {{ value.value_kind === 'UNKNOWN' ? '取消未知' : '记为未知' }}
      </DropdownMenuItem>
      <DropdownMenuItem v-if="!definition.public_only" @select="emit('conceal', value.is_public)">
        {{ value.is_public ? '记为未公开' : '取消未公开' }}
      </DropdownMenuItem>
      <template v-if="multiple && !fixed && (up || down)">
        <DropdownMenuSeparator />
        <DropdownMenuItem :disabled="!up" @select="emit('move', -1)">上移</DropdownMenuItem>
        <DropdownMenuItem :disabled="!down" @select="emit('move', 1)">下移</DropdownMenuItem>
      </template>
      <template v-if="!fixed">
        <DropdownMenuSeparator />
        <DropdownMenuItem v-if="relocatable" @select="emit('relocate')">
          移到另一个条目
        </DropdownMenuItem>
        <DropdownMenuItem @select="emit('remove')">
          {{ added ? '取消添加' : '删除' }}
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>
