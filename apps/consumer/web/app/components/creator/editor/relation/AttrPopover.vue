<script setup lang="ts">
  import { Plus, X } from '@lucide/vue'
  import Popover from 'primevue/popover'
  import type { BackendEditorField, BackendEntitySummary } from '~/features/creator/editor'
  import type { EditorRelationRow, RelationRefValue } from '~/features/creator/editor/relation'
  import { relationRefValues } from '~/features/creator/editor/relation'
  import { enumOptions } from '~/features/creator/editor/presentation/enum-labels'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'

  type RefAttribute = NonNullable<BackendEditorField['ref_attributes']>[number]

  const props = defineProps<{
    attributes: NonNullable<BackendEditorField['attributes']>[number][]
    refAttributes: RefAttribute[]
    target: EntityTarget
  }>()
  const row = defineModel<EditorRelationRow>('row', { required: true })
  const emit = defineEmits<{ remove: [] }>()
  const fieldId = useId()

  const imageClass = computed(() =>
    cn('size-full', props.target === 'producer' ? 'object-contain' : 'object-cover object-top'),
  )

  const popRef = useTemplateRef<InstanceType<typeof Popover>>('popRef')

  defineExpose({
    toggle(event: Event) {
      popRef.value?.toggle(event)
    },
    hide() {
      popRef.value?.hide()
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
    popRef.value?.hide()
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
    // Dialog 由 v-if="activeRef" 控制挂载,其初始化靠 watch(visible) 的 false→true 跳变;
    // 必须先挂载(设 activeRef)、下一 tick 再开,否则挂载即 visible=true,watch 不触发。
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
  <Popover ref="popRef">
    <div class="flex flex-col gap-4" style="min-width: 18rem">
      <div class="flex items-center gap-2">
        <HikariImage
          :src="row.target.cover ?? ''"
          alt=""
          preset="small"
          class="size-8 shrink-0 rounded bg-surface-100 dark:bg-surface-800"
          :image-class="imageClass"
        >
          <template #empty><span /></template>
          <template #error><span /></template>
        </HikariImage>
        <div class="flex min-w-0 flex-col">
          <span class="truncate text-sm font-semibold">
            {{ row.target.name || `#${row.target_id}` }}
          </span>
          <span class="font-mono text-xs text-muted-color">#{{ row.target_id }}</span>
        </div>
      </div>

      <div v-for="attr in attributes" :key="attr.name" class="flex flex-col gap-1.5">
        <label :for="`${fieldId}-${attr.name}`" class="text-xs font-medium">
          {{ ATTR_LABEL[attr.name] ?? attr.name }}
          <span v-if="attr.name === 'relation'" class="text-red-500">*</span>
        </label>
        <Select
          v-if="attr.value_type === 'enum'"
          :input-id="`${fieldId}-${attr.name}`"
          :model-value="asString(attr.name)"
          :options="enumOptions(attr.enum_name, attr.enum_values ?? [])"
          option-label="label"
          option-value="value"
          fluid
          size="small"
          :show-clear="attr.name !== 'relation'"
          @update:model-value="v => setAttr(attr.name, typeof v === 'string' ? v : null)"
        />
        <InputNumber
          v-else-if="attr.value_type === 'int' || attr.value_type === 'float'"
          :input-id="`${fieldId}-${attr.name}`"
          :model-value="asNumber(attr.name)"
          :max-fraction-digits="attr.value_type === 'float' ? 2 : 0"
          :use-grouping="false"
          fluid
          size="small"
          @input="event => setAttr(attr.name, typeof event.value === 'number' ? event.value : null)"
          @update:model-value="v => setAttr(attr.name, typeof v === 'number' ? v : null)"
        />
        <ToggleSwitch
          v-else-if="attr.value_type === 'boolean'"
          :input-id="`${fieldId}-${attr.name}`"
          :model-value="asBoolean(attr.name)"
          @update:model-value="v => setAttr(attr.name, v === true)"
        />
        <InputText
          v-else
          :id="`${fieldId}-${attr.name}`"
          :model-value="asString(attr.name)"
          fluid
          size="small"
          @update:model-value="
            v => setAttr(attr.name, typeof v === 'string' && v !== '' ? v : null)
          "
        />
        <small v-if="attr.help" class="text-xs text-muted-color">{{ attr.help }}</small>
      </div>

      <div v-for="refAttr in refAttributes" :key="refAttr.name" class="flex flex-col gap-1.5">
        <span class="text-xs font-medium">{{ REF_ATTR_LABEL[refAttr.name] ?? refAttr.name }}</span>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="value in refValues(refAttr.name)"
            :key="value.id"
            class="inline-flex items-center gap-1.5 rounded-full bg-surface-100 px-1.5 py-0.5 dark:bg-surface-800"
          >
            <HikariImage
              :src="value.cover ?? ''"
              alt=""
              preset="small"
              class="size-5 shrink-0 rounded-full bg-surface-200 dark:bg-surface-700"
              image-class="size-full object-cover object-top"
            >
              <template #empty><span /></template>
              <template #error><span /></template>
            </HikariImage>
            <span class="text-xs">{{ value.name || `#${value.id}` }}</span>
            <Button
              unstyled
              class="flex size-4 items-center justify-center rounded-full text-muted-color transition-colors hover:text-red-500"
              :aria-label="`移除 ${value.name || value.id}`"
              @click="removeRef(refAttr.name, value.id)"
            >
              <template #icon><X :size="12" /></template>
            </Button>
          </span>
          <Button
            :label="refValues(refAttr.name).length ? '编辑' : '添加'"
            severity="secondary"
            variant="outlined"
            size="small"
            @click="openPicker(refAttr)"
          >
            <template #icon><Plus :size="13" /></template>
          </Button>
        </div>
        <small v-if="refAttr.help" class="text-xs text-muted-color">{{ refAttr.help }}</small>
      </div>

      <div class="flex justify-end pt-1">
        <Button
          label="从关联中移除"
          variant="text"
          severity="danger"
          size="small"
          @click="onRemove"
        />
      </div>
    </div>
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
