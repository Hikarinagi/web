<script setup lang="ts">
  import { Card, Chip, IconButton, Inline, SegmentedControl } from '@hina-ui/vue'
  import { Trash2 } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import {
    BROWSE_FILTER_RECALL_KEY,
    type TagFilterGroup,
    type TagFilterOp,
    type TagMatchMode,
  } from '~/features/browse/filter'

  defineOptions({ name: 'BrowseTagFilterGroup' })
  const props = defineProps<{
    group: TagFilterGroup
    active?: boolean
    canRemove?: boolean
  }>()
  const emit = defineEmits<{
    activate: []
    remove: []
    removeTag: [id: number]
    update: [group: TagFilterGroup]
  }>()

  const filter = inject(BROWSE_FILTER_RECALL_KEY)
  const opOptions: { label: string; value: TagFilterOp }[] = [
    { label: '包含', value: 'include' },
    { label: '排除', value: 'exclude' },
  ]
  const includeMatchOptions: { label: string; value: TagMatchMode }[] = [
    { label: '全部满足', value: 'and' },
    { label: '任一满足', value: 'or' },
  ]
  const excludeMatchOptions: { label: string; value: TagMatchMode }[] = [
    { label: '任一命中', value: 'or' },
    { label: '全部命中', value: 'and' },
  ]
  const matchOptions = computed(() =>
    props.group.op === 'include' ? includeMatchOptions : excludeMatchOptions,
  )

  function changeOp(value: string | number | undefined) {
    if (value !== 'include' && value !== 'exclude') return
    emit('update', {
      ...props.group,
      op: value,
      match: value === 'include' ? 'and' : 'or',
    })
  }

  function changeMatch(value: string | number | undefined) {
    if (value !== 'and' && value !== 'or') return
    emit('update', { ...props.group, match: value })
  }
</script>

<template>
  <Card
    :padded="false"
    role="button"
    tabindex="0"
    :class="
      cn(
        'hn-state-layer block w-full hn-interactive p-2 text-left hn-press-none',
        active && 'border-accent bg-accent-soft',
      )
    "
    @click="emit('activate')"
    @keydown.enter.prevent="emit('activate')"
    @keydown.space.prevent="emit('activate')"
  >
    <Inline gap="sm">
      <SegmentedControl
        :model-value="group.op"
        :options="opOptions"
        size="sm"
        @click.stop
        @keydown.stop
        @update:model-value="changeOp"
      />
      <SegmentedControl
        :model-value="group.match"
        :options="matchOptions"
        size="sm"
        @click.stop
        @keydown.stop
        @update:model-value="changeMatch"
      />
      <IconButton
        v-if="canRemove"
        label="删除条件组"
        size="sm"
        class="ms-auto"
        @click.stop="emit('remove')"
      >
        <Trash2 />
      </IconButton>
    </Inline>

    <Inline gap="none" class="mt-2 min-h-8 gap-1.5">
      <Chip
        v-for="id in group.tag_ids"
        :key="id"
        removable
        @click.stop
        @keydown.stop
        @remove="emit('removeTag', id)"
      >
        {{ filter?.entityLabel('tag', id) ?? `#${id}` }}
      </Chip>
    </Inline>
  </Card>
</template>
