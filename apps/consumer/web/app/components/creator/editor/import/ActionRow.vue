<script setup lang="ts">
  import { Checkbox, Inline, Tag } from '@hina-ui/vue'
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
  <Inline
    gap="sm"
    align="start"
    :wrap="false"
    class="w-full"
    :class="state === 'done' ? 'opacity-60' : ''"
  >
    <Checkbox
      :model-value="checked"
      :disabled="state === 'done' || running"
      :aria-label="action.label"
      class="mt-3 shrink-0"
      @update:model-value="emit('toggle')"
    />
    <CreatorChangesetFieldDiff :op="action.op" :label="action.label" class="min-w-0 flex-1" />
    <Tag
      v-if="state !== 'pending'"
      size="sm"
      :tone="state === 'done' ? 'success' : 'danger'"
      class="mt-3 shrink-0"
    >
      {{ state === 'done' ? '已应用' : '失败' }}
    </Tag>
  </Inline>
</template>
