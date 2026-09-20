<script setup lang="ts">
  import Dialog from 'primevue/dialog'
  import { Plus } from '@lucide/vue'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import { CREATABLE_ENTITY } from '~/features/creator/editor/entity-create'
  import {
    useEntitySearch,
    type EntityTarget,
  } from '~/features/creator/composables/useEntitySearch'

  const props = defineProps<{
    target: EntityTarget
    mode: 'single' | 'multi'
    title?: string
    selectedEntities?: BackendEntitySummary[]
  }>()
  const visible = defineModel<boolean>('visible', { default: false })
  const emit = defineEmits<{ select: [items: BackendEntitySummary[]] }>()

  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

  const tab = ref<'all' | 'selected'>('all')
  const staged = ref<BackendEntitySummary[]>([])
  const selectedIds = ref<Set<number>>(new Set())
  const { query, results, loading, searched, refresh, reset } = useEntitySearch(() => props.target)

  const createConfig = computed(() => CREATABLE_ENTITY[props.target] ?? null)
  const showCreate = computed(() => {
    if (!createConfig.value || tab.value !== 'all') return false
    const q = query.value.trim().toLowerCase()
    if (!q || loading.value || !searched.value) return false
    return true
  })
  const createLabel = computed(() => `新建「${query.value.trim()}」`)
  const creating = ref(false)

  watch(visible, async v => {
    if (!v) return
    tab.value = 'all'
    creating.value = false
    reset()
    const initial = props.selectedEntities ?? []
    staged.value = [...initial]
    selectedIds.value = new Set(initial.map(i => i.id))
    await refresh()
  })

  const tabOptions = computed(() => [
    { id: 'all', label: '全部' },
    { id: 'selected', label: `已选 ${selectedIds.value.size}` },
  ])

  const visibleItems = computed(() => {
    if (tab.value === 'all') return results.value
    const q = query.value.toLowerCase().trim()
    if (!q) return staged.value
    return staged.value.filter(
      item => (item.name ?? '').toLowerCase().includes(q) || String(item.id).includes(q),
    )
  })

  const emptyText = computed(() => {
    if (tab.value === 'all') return query.value ? '没有匹配项' : '搜索以查看候选'
    return '尚未选择任何项'
  })

  const showSkeleton = computed(() => loading.value && tab.value === 'all')

  function toggle(item: BackendEntitySummary) {
    if (props.mode === 'single') {
      staged.value = [item]
      selectedIds.value = new Set([item.id])
      confirm()
      return
    }
    const next = new Set(selectedIds.value)
    if (next.has(item.id)) {
      next.delete(item.id)
    } else {
      next.add(item.id)
      if (!staged.value.some(s => s.id === item.id)) {
        staged.value = [...staged.value, item]
      }
    }
    selectedIds.value = next
  }

  function confirm() {
    emit(
      'select',
      staged.value.filter(s => selectedIds.value.has(s.id)),
    )
    visible.value = false
  }

  function onCreated(entity: BackendEntitySummary) {
    creating.value = false
    if (props.mode === 'single') {
      staged.value = [entity]
      selectedIds.value = new Set([entity.id])
      confirm()
      return
    }
    if (!staged.value.some(s => s.id === entity.id)) staged.value = [entity, ...staged.value]
    selectedIds.value = new Set([...selectedIds.value, entity.id])
    tab.value = 'selected'
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="title || (mode === 'single' ? '选择' : '选择多个')"
    dismissable-mask
    :scroll="false"
    :style="{ width: '92vw', maxWidth: '46rem' }"
  >
    <div class="flex flex-col gap-3">
      <CreatorEditorRelationPickerCreate
        v-if="creating"
        :target="target"
        :preset-name="query"
        @created="onCreated"
        @cancel="creating = false"
      />
      <template v-else>
        <InputText v-model="query" placeholder="搜索 名字 / 别名 / ID…" fluid />
        <SelectButton
          v-if="mode === 'multi'"
          v-model="tab"
          :options="tabOptions"
          option-label="label"
          option-value="id"
          :allow-empty="false"
          size="small"
        />
        <div class="h-[55vh]">
          <ScrollArea v-if="showSkeleton || visibleItems.length || showCreate" class="size-full">
            <div class="grid grid-cols-3 gap-3 px-0.5 py-1">
              <template v-if="showSkeleton">
                <div
                  v-for="i in 9"
                  :key="`sk-${i}`"
                  class="flex flex-col gap-1.5 rounded-lg border border-surface-200 p-2 dark:border-surface-700"
                >
                  <Skeleton class="aspect-square h-auto! w-full!" border-radius="0.25rem" />
                  <Skeleton width="60%" height="0.875rem" />
                  <Skeleton width="35%" height="0.75rem" />
                </div>
              </template>
              <template v-else>
                <Button
                  v-if="showCreate"
                  unstyled
                  class="flex flex-col gap-1.5 rounded-lg border border-dashed border-surface-200 p-2 text-left transition-colors hover:border-surface-300 dark:border-surface-700 dark:hover:border-surface-600"
                  @click="creating = true"
                >
                  <span
                    class="flex aspect-square w-full items-center justify-center rounded bg-surface-100 dark:bg-surface-800"
                  >
                    <Plus :size="24" class="text-muted-color" />
                  </span>
                  <span class="truncate text-sm font-medium">{{ createLabel }}</span>
                  <span class="text-xs text-muted-color">{{ createConfig?.label }}</span>
                </Button>
                <CreatorEditorRelationPickerCard
                  v-for="item in visibleItems"
                  :key="item.id"
                  :item="item"
                  :target="target"
                  :selected="selectedIds.has(item.id)"
                  @click="toggle(item)"
                />
              </template>
            </div>
          </ScrollArea>
          <div v-else class="flex h-full items-center justify-center">
            <CreatorEmpty :text="emptyText" />
          </div>
        </div>

        <div class="flex items-center justify-between gap-3">
          <span class="text-sm text-muted-color">已选 {{ selectedIds.size }} 项</span>
          <div class="flex items-center gap-3">
            <Button label="取消" severity="secondary" @click="visible = false" />
            <Button v-if="mode === 'multi'" label="确认" @click="confirm" />
          </div>
        </div>
      </template>
    </div>
  </Dialog>
</template>
