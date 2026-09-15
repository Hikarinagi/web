<script setup lang="ts">
  import {
    Button,
    Chip,
    FormField,
    Inline,
    Input,
    NumberInput,
    Popover,
    Select,
    Stack,
    Switch,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type { BackendEditorField, BackendEntitySummary } from '~/features/creator/editor'
  import type { EditorRelationRow, RelationRefValue } from '~/features/creator/editor/relation'
  import { relationRefValues } from '~/features/creator/editor/relation'
  import { enumOptions } from '~/features/creator/editor/presentation/enum-labels'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { ENTITY_FALLBACK_IMAGE, ENTITY_KINDS } from '~/features/entity/entity'

  type RefAttribute = NonNullable<BackendEditorField['ref_attributes']>[number]

  const props = defineProps<{
    attributes: NonNullable<BackendEditorField['attributes']>[number][]
    refAttributes: RefAttribute[]
    target: EntityTarget
  }>()
  const row = defineModel<EditorRelationRow>('row', { required: true })
  const emit = defineEmits<{ remove: [] }>()

  const imageClass = computed(() =>
    cn('size-full', props.target === 'producer' ? 'object-contain' : 'object-cover object-top'),
  )
  const cover = computed(
    () =>
      row.value.target.cover ?? (ENTITY_KINDS.includes(props.target) ? ENTITY_FALLBACK_IMAGE : ''),
  )

  const anchor = shallowRef<HTMLElement | null>(null)
  const open = ref(false)

  defineExpose({
    toggle(event: Event) {
      anchor.value = (event.currentTarget ?? event.target) as HTMLElement
      open.value = !open.value
    },
    hide() {
      open.value = false
    },
  })

  const ATTR_LABEL: Record<string, string> = {
    note: '备注',
    role: '角色 / 职责',
    relation: '关系类型',
  }
  const REF_ATTR_LABEL: Record<string, string> = {
    actors: '声优',
  }

  function setAttr(key: string, value: unknown) {
    row.value = {
      ...row.value,
      attributes: { ...row.value.attributes, [key]: value },
    }
  }
  function asString(key: string): string {
    const v = row.value.attributes[key]
    return typeof v === 'string' ? v : ''
  }
  function asNumber(key: string): number | null {
    const v = row.value.attributes[key]
    return typeof v === 'number' && Number.isFinite(v) ? v : null
  }
  function asBoolean(key: string): boolean {
    return row.value.attributes[key] === true
  }
  function onRemove() {
    emit('remove')
    open.value = false
  }

  // ref 属性(如声优)各自复用实体 picker;同一 popover 内多个 ref 属性共用一个 Dialog。
  const pickerOpen = ref(false)
  const activeRef = ref<RefAttribute | null>(null)

  function refValues(name: string): RelationRefValue[] {
    return relationRefValues(row.value, name)
  }
  function setRefValues(name: string, values: RelationRefValue[]) {
    row.value = {
      ...row.value,
      ref_attributes: { ...(row.value.ref_attributes ?? {}), [name]: values },
    }
  }
  async function openPicker(refAttr: RefAttribute) {
    // Dialog 由 v-if="activeRef" 控制挂载，其初始化靠 watch(visible) 的 false→true 跳变；
    // 必须先挂载(设 activeRef)、下一 tick 再开，否则挂载即 visible=true,watch 不触发。
    activeRef.value = refAttr
    await nextTick()
    pickerOpen.value = true
  }
  const pickerSelected = computed<BackendEntitySummary[]>(() =>
    activeRef.value
      ? refValues(activeRef.value.name).map(v => ({
          id: v.id,
          name: v.name,
          cover: v.cover,
          status: 'PUBLISHED' as const,
        }))
      : [],
  )
  function onPickRef(items: BackendEntitySummary[]) {
    if (!activeRef.value) return
    setRefValues(
      activeRef.value.name,
      items.map(item => ({ id: item.id, name: item.name, cover: item.cover })),
    )
  }
  function removeRef(name: string, id: number) {
    setRefValues(
      name,
      refValues(name).filter(v => v.id !== id),
    )
  }
</script>

<template>
  <Popover v-model:open="open" :anchor="anchor" align="start" class="w-72">
    <template #content>
      <Stack gap="md">
        <Inline gap="sm" align="center" :wrap="false">
          <HikariImage
            :src="cover"
            alt=""
            preset="small"
            class="size-8 shrink-0 rounded bg-subtle"
            :image-class="imageClass"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
          <Stack gap="none" class="min-w-0">
            <Text as="span" size="sm" weight="semibold" truncate>
              {{ row.target.name || `#${row.target_id}` }}
            </Text>
            <Text as="span" size="xs" tone="muted" class="font-mono">#{{ row.target_id }}</Text>
          </Stack>
        </Inline>

        <FormField
          v-for="attr in attributes"
          :key="attr.name"
          :label="ATTR_LABEL[attr.name] ?? attr.name"
          :description="attr.help ?? undefined"
          description-placement="control"
          :required="attr.name === 'relation'"
        >
          <Select
            v-if="attr.value_type === 'enum'"
            size="sm"
            :model-value="asString(attr.name) || null"
            :options="enumOptions(attr.enum_name, attr.enum_values ?? [])"
            :clearable="attr.name !== 'relation'"
            @update:model-value="v => setAttr(attr.name, typeof v === 'string' ? v : null)"
          />
          <NumberInput
            v-else-if="attr.value_type === 'int' || attr.value_type === 'float'"
            size="sm"
            :model-value="asNumber(attr.name)"
            :format-options="{
              maximumFractionDigits: attr.value_type === 'float' ? 2 : 0,
              useGrouping: false,
            }"
            @update:model-value="v => setAttr(attr.name, typeof v === 'number' ? v : null)"
          />
          <Switch
            v-else-if="attr.value_type === 'boolean'"
            :model-value="asBoolean(attr.name)"
            @update:model-value="v => setAttr(attr.name, v === true)"
          />
          <Input
            v-else
            size="sm"
            :model-value="asString(attr.name)"
            @update:model-value="v => setAttr(attr.name, v ? v : null)"
          />
        </FormField>

        <FormField
          v-for="refAttr in refAttributes"
          :key="refAttr.name"
          :label="REF_ATTR_LABEL[refAttr.name] ?? refAttr.name"
          :description="refAttr.help ?? undefined"
          description-placement="control"
        >
          <Inline gap="xs">
            <Chip
              v-for="value in refValues(refAttr.name)"
              :key="value.id"
              size="sm"
              removable
              @remove="removeRef(refAttr.name, value.id)"
            >
              <template #icon>
                <HikariImage
                  :src="value.cover ?? ''"
                  alt=""
                  preset="small"
                  class="size-5 shrink-0 rounded-full bg-subtle"
                  image-class="size-full object-cover object-top"
                >
                  <template #empty><span /></template>
                  <template #error><span /></template>
                </HikariImage>
              </template>
              {{ value.name || `#${value.id}` }}
            </Chip>
            <Button variant="outline" tone="neutral" size="sm" @click="openPicker(refAttr)">
              <template #icon><Plus /></template>
              {{ refValues(refAttr.name).length ? '编辑' : '添加' }}
            </Button>
          </Inline>
        </FormField>

        <Inline justify="end">
          <Button variant="ghost" tone="danger" size="sm" @click="onRemove">从关联中移除</Button>
        </Inline>
      </Stack>
    </template>
  </Popover>

  <CreatorEditorRelationPickerDialog
    v-if="activeRef"
    v-model:visible="pickerOpen"
    :target="activeRef.ref_target as EntityTarget"
    :mode="activeRef.multiple ? 'multi' : 'single'"
    :selected-entities="pickerSelected"
    :title="`选择${REF_ATTR_LABEL[activeRef.name] ?? activeRef.name}`"
    @select="onPickRef"
  />
</template>
