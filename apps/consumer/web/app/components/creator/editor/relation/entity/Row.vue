<script setup lang="ts">
  import { Badge, Card, Chip, IconButton, Inline, Stack, Tag, Text } from '@hina-ui/vue'
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

  const badges = computed(() =>
    props.attributes
      .map(attr => ({ name: attr.name, value: attrBadge(attr.name) }))
      .filter((badge): badge is { name: string; value: string } => badge.value !== null),
  )

  const refPreview = computed(() =>
    props.refAttributes.flatMap(refAttr => relationRefValues(props.row, refAttr.name)),
  )
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="w-full">
    <Card
      :as="hasEditable ? 'button' : 'div'"
      :type="hasEditable ? 'button' : undefined"
      :padded="false"
      :class="
        cn(
          'min-w-0 flex-1 text-start',
          hasEditable && 'hn-state-layer hn-interactive hn-press-none',
        )
      "
      @click="togglePopover"
    >
      <Inline gap="md" align="center" :wrap="false" class="p-2.5">
        <HikariImage
          :src="cover"
          alt=""
          preset="small"
          class="size-10 shrink-0 rounded bg-subtle"
          :image-class="imageClass"
        >
          <template #empty />
          <template #error />
        </HikariImage>

        <Stack gap="xs" class="min-w-0 flex-1">
          <Inline gap="xs" align="center">
            <Text as="span" size="sm" weight="medium" truncate class="min-w-0">
              {{ row.target.name || `#${row.target_id}` }}
            </Text>
            <Tag v-for="badge in badges" :key="badge.name" size="sm" tone="neutral">
              {{ ATTR_LABEL[badge.name] ?? badge.name }}：{{ badge.value }}
            </Tag>
          </Inline>

          <Inline gap="xs" align="center">
            <Text as="span" size="xs" tone="muted" class="font-mono">#{{ row.target_id }}</Text>
            <Chip v-for="value in refPreview" :key="value.id" size="sm">
              <template #icon>
                <HikariImage
                  :src="value.cover ?? ''"
                  alt=""
                  preset="small"
                  class="size-4 shrink-0 rounded-full bg-subtle"
                  image-class="size-full object-cover object-top"
                >
                  <template #empty />
                  <template #error />
                </HikariImage>
              </template>
              {{ value.name || `#${value.id}` }}
            </Chip>
          </Inline>
        </Stack>

        <AttrPopover
          v-if="hasEditable"
          ref="popoverRef"
          v-model:row="rowProxy"
          :attributes="attributes"
          :ref-attributes="refAttributes"
          :target="target"
          @remove="emit('remove')"
        />
      </Inline>
    </Card>

    <IconButton
      v-if="!hasEditable"
      label="移除"
      variant="ghost"
      tone="neutral"
      size="sm"
      pill
      class="shrink-0"
      @click="emit('remove')"
    >
      <X />
    </IconButton>

    <Badge
      v-if="editable"
      :content="dirtyCount || null"
      tone="warning"
      :label="dirtyCount ? `已暂存 ${dirtyCount} 项修改` : undefined"
      class="shrink-0"
    >
      <IconButton
        v-tooltip="dirtyCount ? `已暂存 ${dirtyCount} 项修改` : '编辑条目'"
        :label="dirtyCount ? `编辑条目（已暂存 ${dirtyCount} 项修改）` : '编辑条目'"
        variant="ghost"
        tone="neutral"
        size="sm"
        pill
        @click="emit('edit')"
      >
        <Pencil />
      </IconButton>
    </Badge>
  </Inline>
</template>
