<script setup lang="ts">
  import { Pencil, X } from '@lucide/vue'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import { relationRefValues } from '~/features/creator/editor/relation'
  import { enumLabel } from '~/features/creator/editor/presentation/enum-labels'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { ENTITY_FALLBACK_IMAGE, ENTITY_KINDS } from '~/features/entity/entity'
  import AttrPopover from '~/components/creator/editor/relation/AttrPopover.vue'

  const props = defineProps<{
    row: EditorRelationRow
    attributes: NonNullable<BackendEditorField['attributes']>[number][]
    refAttributes: NonNullable<BackendEditorField['ref_attributes']>[number][]
    target: EntityTarget
    editable?: boolean
    dirtyCount?: number
  }>()
  const emit = defineEmits<{
    'update:row': [row: EditorRelationRow]
    remove: []
    edit: []
  }>()

  const imageClass = computed(() =>
    cn('size-full', props.target === 'producer' ? 'object-contain' : 'object-cover object-top'),
  )
  const cover = computed(
    () =>
      props.row.target.cover ?? (ENTITY_KINDS.includes(props.target) ? ENTITY_FALLBACK_IMAGE : ''),
  )

  const popoverRef = useTemplateRef<InstanceType<typeof AttrPopover>>('popoverRef')

  const rowProxy = computed<EditorRelationRow>({
    get: () => props.row,
    set: v => emit('update:row', v),
  })

  const hasEditable = computed(() => props.attributes.length > 0 || props.refAttributes.length > 0)

  function togglePopover(event: Event) {
    if (!hasEditable.value) return
    popoverRef.value?.toggle(event)
  }

  const ATTR_LABEL: Record<string, string> = { note: '备注', role: '角色' }

  function attrBadge(key: string): string | null {
    const v = props.row.attributes[key]
    if (v == null || v === '') return null
    const attr = props.attributes.find(a => a.name === key)
    return attr?.value_type === 'enum' ? enumLabel(attr.enum_name, String(v)) : String(v)
  }

  const refPreview = computed(() =>
    props.refAttributes.flatMap(refAttr => relationRefValues(props.row, refAttr.name)),
  )
</script>

<template>
  <div class="flex w-full items-center gap-2">
    <Button
      v-if="hasEditable"
      unstyled
      class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-(--p-form-field-border-color) bg-(--p-form-field-background) p-2.5 text-left transition-colors hover:border-(--p-form-field-hover-border-color) focus:border-(--p-form-field-focus-border-color) focus:outline-none"
      @click="togglePopover"
    >
      <HikariImage
        :src="cover"
        alt=""
        preset="small"
        class="size-10 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        :image-class="imageClass"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="truncate text-sm font-medium">
            {{ row.target.name || `#${row.target_id}` }}
          </span>
          <span
            v-for="attr in attributes"
            v-show="attrBadge(attr.name)"
            :key="attr.name"
            class="inline-flex items-center rounded bg-surface-100 px-1.5 py-0.5 text-[10px] text-surface-700 dark:bg-surface-800 dark:text-surface-200"
          >
            {{ ATTR_LABEL[attr.name] ?? attr.name }}：{{ attrBadge(attr.name) }}
          </span>
        </div>
        <div class="flex items-center gap-1">
          <span class="font-mono text-xs text-muted-color">#{{ row.target_id }}</span>
          <span
            v-for="value in refPreview"
            :key="value.id"
            class="inline-flex items-center gap-1 rounded-full bg-surface-100 py-0.5 pr-1.5 pl-0.5 dark:bg-surface-800"
          >
            <HikariImage
              :src="value.cover ?? ''"
              alt=""
              preset="small"
              class="size-4 shrink-0 rounded-full bg-surface-200 dark:bg-surface-700"
              image-class="size-full object-cover object-top"
            >
              <template #empty><span /></template>
              <template #error><span /></template>
            </HikariImage>
            <span class="text-[10px] text-surface-700 dark:text-surface-200">
              {{ value.name || `#${value.id}` }}
            </span>
          </span>
        </div>
      </div>
      <AttrPopover
        ref="popoverRef"
        v-model:row="rowProxy"
        :attributes="attributes"
        :ref-attributes="refAttributes"
        :target="target"
        @remove="emit('remove')"
      />
    </Button>

    <div
      v-else
      class="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-(--p-form-field-border-color) bg-(--p-form-field-background) p-2.5"
    >
      <HikariImage
        :src="cover"
        alt=""
        preset="small"
        class="size-10 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
        :image-class="imageClass"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col">
        <span class="truncate text-sm font-medium">
          {{ row.target.name || `#${row.target_id}` }}
        </span>
        <span class="font-mono text-xs text-muted-color">#{{ row.target_id }}</span>
      </div>
      <Button
        unstyled
        class="flex size-7 shrink-0 items-center justify-center rounded-full text-muted-color transition-colors hover:bg-surface-100 hover:text-red-500 dark:hover:bg-surface-800"
        aria-label="移除"
        @click="emit('remove')"
      >
        <template #icon><X :size="15" /></template>
      </Button>
    </div>

    <Button
      v-if="editable"
      v-tooltip.top="dirtyCount ? `已暂存 ${dirtyCount} 项修改` : '编辑条目'"
      unstyled
      class="relative flex size-7 shrink-0 items-center justify-center rounded-full text-muted-color transition-colors hover:bg-surface-100 hover:text-color dark:hover:bg-surface-800"
      :aria-label="dirtyCount ? `编辑条目（已暂存 ${dirtyCount} 项修改）` : '编辑条目'"
      @click="emit('edit')"
    >
      <template #icon>
        <Pencil :size="14" />
        <span
          v-if="dirtyCount"
          class="absolute top-0.5 right-0.5 size-2 rounded-full bg-amber-500"
        />
      </template>
    </Button>
  </div>
</template>
