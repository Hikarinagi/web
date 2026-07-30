<script setup lang="ts">
  import type { RosterAction } from '~/features/creator/editor/roster-actions'

  defineProps<{
    action: RosterAction
    checked: boolean
    state: 'pending' | 'done' | 'failed'
    running: boolean
  }>()
  const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <label
    class="flex w-full items-start gap-2"
    :class="state === 'done' ? 'opacity-60' : 'cursor-pointer'"
  >
    <Checkbox
      :model-value="checked"
      binary
      class="mt-3 shrink-0"
      :disabled="state === 'done' || running"
      @update:model-value="emit('toggle')"
    />
    <div class="pointer-events-none min-w-0 flex-1">
      <CreatorChangesetFieldDiff :op="action.op" :label="action.label" />
    </div>
    <Tag
      v-if="state !== 'pending'"
      class="mt-3 shrink-0"
      :value="state === 'done' ? '已应用' : '失败'"
      :severity="state === 'done' ? 'success' : 'danger'"
    />
  </label>
</template>
