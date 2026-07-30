<script setup lang="ts">
  import type { BackendPermissionCatalogEntry } from '~/features/creator/governance'
  import {
    buildPermissionTree,
    keysFromSelectionRecord,
    selectionRecordFromKeys,
    type PermissionTreeNode,
  } from '~/features/creator/governance/permissionTree'

  const props = defineProps<{
    entries: readonly BackendPermissionCatalogEntry[]
    readonly?: boolean
  }>()
  const model = defineModel<string[]>({ default: () => [] })

  provide('$pcForm', undefined)
  provide('$pcFormField', undefined)

  const safeModel = computed(() => (Array.isArray(model.value) ? model.value : []))
  const tree = computed(() => buildPermissionTree(props.entries))
  const selectionKeys = ref<Record<string, { checked: boolean; partialChecked: boolean }>>(
    selectionRecordFromKeys(safeModel.value, tree.value),
  )

  watch(
    [tree, safeModel],
    ([nextTree, nextModel]) => {
      const incoming = selectionRecordFromKeys(nextModel, nextTree)
      if (JSON.stringify(incoming) !== JSON.stringify(selectionKeys.value)) {
        selectionKeys.value = incoming
      }
    },
    { deep: true },
  )

  function collectCheckedAncestors(
    nodes: readonly PermissionTreeNode[],
    checked: Set<string>,
    into: Record<string, boolean> = {},
    ancestors: string[] = [],
  ) {
    for (const node of nodes) {
      if (node.children?.length) {
        collectCheckedAncestors(node.children, checked, into, [...ancestors, node.key])
      } else if (checked.has(node.key)) {
        for (const key of ancestors) into[key] = true
      }
    }
    return into
  }

  const expandedKeys = ref<Record<string, boolean>>({})
  let initialized = false
  watch(
    tree,
    next => {
      if (initialized || !next.length) return
      expandedKeys.value = collectCheckedAncestors(next, new Set(safeModel.value))
      initialized = true
    },
    { immediate: true },
  )

  function onSelectionChange(next: Record<string, { checked: boolean; partialChecked: boolean }>) {
    if (props.readonly) return
    selectionKeys.value = next
    const keys = keysFromSelectionRecord(next, tree.value)
    if (JSON.stringify(keys) !== JSON.stringify([...safeModel.value].sort())) {
      model.value = keys
    }
  }
</script>

<template>
  <Tree
    v-model:expanded-keys="expandedKeys"
    :value="tree"
    :selection-keys="selectionKeys"
    selection-mode="checkbox"
    :class="['w-full border-0 p-0!', readonly && 'select-none']"
    :pt="{ root: { class: 'bg-transparent' } }"
    @update:selection-keys="onSelectionChange"
  />
</template>
