<script setup lang="ts">
  import { Trash2 } from '@lucide/vue'
  import type { TagFilterGroup, TagFilterOp, TagMatchMode } from '~/features/manga/explore'
  import { BROWSE_FILTER_KEY } from '~/features/manga/useBrowseFilter'

  defineOptions({ name: 'MangaBrowseTagFilterGroup' })
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

  const filter = inject(BROWSE_FILTER_KEY)
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

  function changeOp(value: TagFilterOp) {
    emit('update', {
      ...props.group,
      op: value,
      match: value === 'include' ? 'and' : 'or',
    })
  }

  function changeMatch(value: TagMatchMode) {
    emit('update', { ...props.group, match: value })
  }
</script>

<template>
  <Button
    unstyled
    as="div"
    role="button"
    tabindex="0"
    :class="[
      'block w-full cursor-pointer rounded-lg border p-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-hikari-primary-500',
      active
        ? 'ripple-off border-hikari-primary-400 bg-hikari-primary-50/60 dark:border-hikari-primary-600 dark:bg-hikari-primary-950/30'
        : 'border-surface-200 bg-surface-0 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:hover:border-surface-700 dark:hover:bg-surface-800/70',
    ]"
    @click="emit('activate')"
    @keydown.enter.prevent="emit('activate')"
    @keydown.space.prevent="emit('activate')"
  >
    <div class="flex flex-wrap items-center gap-2">
      <SelectButton
        :model-value="group.op"
        :options="opOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        @click.stop
        @keydown.stop
        @change="event => changeOp(event.value)"
      />
      <SelectButton
        :model-value="group.match"
        :options="matchOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        @click.stop
        @keydown.stop
        @change="event => changeMatch(event.value)"
      />
      <Button
        v-if="canRemove"
        v-tooltip.top="'删除条件组'"
        text
        severity="secondary"
        size="small"
        aria-label="删除条件组"
        class="ml-auto"
        @click.stop="emit('remove')"
      >
        <Trash2 class="size-4" />
      </Button>
    </div>

    <div class="mt-2 flex min-h-8 flex-wrap items-center gap-1.5">
      <Chip
        v-for="id in group.tag_ids"
        :key="id"
        :label="filter?.entityLabel('tag', id) ?? `#${id}`"
        removable
        class="h-8! rounded-lg! px-2.5! py-0! text-sm! leading-none! [&_.p-chip-label]:leading-none! [&_.p-chip-remove-icon]:size-4!"
        @click.stop
        @keydown.stop
        @remove="emit('removeTag', id)"
      />
    </div>
  </Button>
</template>

<style scoped>
  .ripple-off > :deep([data-p-ink]) {
    display: none;
  }
</style>
