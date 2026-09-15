<script setup lang="ts">
  import { Tree, type TreeValue } from '@hina-ui/vue'
  import type { BackendPermissionCatalogEntry } from '~/features/creator/governance'
  import {
    buildPermissionTree,
    expandedForKeys,
    permissionLeafKeys,
  } from '~/features/creator/governance/permissionTree'

  const props = defineProps<{
    entries: readonly BackendPermissionCatalogEntry[]
    readonly?: boolean
  }>()
  const model = defineModel<string[]>({ default: () => [] })

  const safeModel = computed(() => (Array.isArray(model.value) ? model.value : []))
  const tree = computed(() => buildPermissionTree(props.entries))
  const leaves = computed(() => permissionLeafKeys(tree.value))

  const checked = computed<TreeValue[]>({
    get: () => safeModel.value,
    set: next => {
      if (props.readonly) return
      const keys = next
        .map(String)
        .filter(key => leaves.value.has(key))
        .sort()
      if (JSON.stringify(keys) !== JSON.stringify([...safeModel.value].sort())) {
        model.value = keys
      }
    },
  })

  const expanded = ref<TreeValue[]>([])
  let seeded = false
  watch(
    tree,
    next => {
      if (seeded || !next.length) return
      expanded.value = expandedForKeys(next, safeModel.value)
      seeded = true
    },
    { immediate: true },
  )
</script>

<template>
  <Tree
    v-model="checked"
    v-model:expanded="expanded"
    multiple
    :items="tree"
    :disabled="readonly"
    aria-label="权限"
    class="w-full"
  />
</template>
