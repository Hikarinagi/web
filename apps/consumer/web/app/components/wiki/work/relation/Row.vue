<script setup lang="ts">
  import { IconButton, Inline, Stack, TableCell, TableRow } from '@hina-ui/vue'
  import { Undo2, X } from '@lucide/vue'
  import type { RelationRow } from '~/features/wiki/editor/relations'
  import type { WikiSearchItem } from '~/features/wiki/entries'

  defineOptions({ name: 'WikiWorkRelationRow' })

  defineProps<{
    row: RelationRow
    card?: WikiSearchItem
    options: { value: string; label: string }[]
  }>()
  const emit = defineEmits<{ kind: [code: string]; flip: []; remove: []; undo: [] }>()
  const TONE: Record<RelationRow['state'], string> = {
    same: '',
    added: 'bg-success-soft',
    changed: 'bg-accent-soft',
    flipped: 'bg-accent-soft',
    removed: 'bg-danger-soft',
  }
</script>

<template>
  <TableRow :class="TONE[row.state]">
    <TableCell class="w-full max-w-0 py-2.5">
      <Stack gap="sm">
        <WikiWorkLine :work="row.other" :card="card" link :strike="row.state === 'removed'" />
        <WikiWorkRelationKind
          :row="row"
          :options="options"
          class="sm:hidden"
          @kind="code => emit('kind', code)"
          @flip="emit('flip')"
        />
      </Stack>
    </TableCell>
    <TableCell class="py-2.5 max-sm:hidden">
      <WikiWorkRelationKind
        :row="row"
        :options="options"
        @kind="code => emit('kind', code)"
        @flip="emit('flip')"
      />
    </TableCell>
    <TableCell class="py-2.5">
      <Inline justify="end" :wrap="false">
        <IconButton
          v-if="row.undo.length && row.state !== 'added'"
          label="撤回"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('undo')"
        >
          <Undo2 />
        </IconButton>
        <IconButton
          v-if="row.state !== 'removed'"
          :label="row.state === 'added' ? '取消添加' : '删除'"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('remove')"
        >
          <X />
        </IconButton>
      </Inline>
    </TableCell>
  </TableRow>
</template>
