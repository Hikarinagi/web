<script setup lang="ts">
  import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
  } from '@hina-ui/vue'
  import type { Placement } from '@floating-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariEditorMenuFloating' })

  export interface EditorMenuItem {
    id: string
    icon: Component
    label: string
    danger?: boolean
    checked?: boolean
  }

  export interface EditorMenuGroup {
    label?: string
    items: EditorMenuItem[]
  }

  const props = withDefaults(
    defineProps<{
      open: boolean
      anchor: HTMLElement | null
      groups: EditorMenuGroup[]
      placement?: Placement
    }>(),
    { placement: 'left' },
  )

  const emit = defineEmits<{ select: [id: string]; close: [] }>()

  const side = computed(
    () => (props.placement.split('-')[0] ?? 'left') as 'top' | 'right' | 'bottom' | 'left',
  )
  const align = computed(() => {
    const part = props.placement.split('-')[1]
    return part === 'start' || part === 'end' ? part : 'center'
  })

  const open = computed({
    get: () => props.open,
    set: value => {
      if (!value) emit('close')
    },
  })

  type MenuEntry =
    | { kind: 'separator'; key: string }
    | { kind: 'label'; key: string; label: string }
    | { kind: 'item'; key: string; item: EditorMenuItem }

  const snapshot = shallowRef<EditorMenuGroup[]>([])

  watch(
    () => props.open,
    value => {
      if (value) snapshot.value = props.groups
    },
    { immediate: true },
  )

  const entries = computed<MenuEntry[]>(() => {
    const out: MenuEntry[] = []
    snapshot.value.forEach((group, index) => {
      if (index > 0) out.push({ kind: 'separator', key: `separator-${index}` })
      if (group.label) out.push({ kind: 'label', key: `label-${index}`, label: group.label })
      for (const item of group.items) out.push({ kind: 'item', key: item.id, item })
    })
    return out
  })
</script>

<template>
  <DropdownMenu
    v-model:open="open"
    :anchor="anchor"
    :side="side"
    :align="align"
    label="编辑器操作"
    class="min-w-50"
  >
    <template #content>
      <template v-for="entry in entries" :key="entry.key">
        <DropdownMenuSeparator v-if="entry.kind === 'separator'" />
        <DropdownMenuLabel v-else-if="entry.kind === 'label'">{{ entry.label }}</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          v-else-if="entry.item.checked !== undefined"
          :checked="entry.item.checked"
          @select="emit('select', entry.item.id)"
        >
          {{ entry.item.label }}
        </DropdownMenuCheckboxItem>
        <DropdownMenuItem
          v-else
          :tone="entry.item.danger ? 'danger' : 'neutral'"
          @select="emit('select', entry.item.id)"
        >
          <template #icon><component :is="entry.item.icon" /></template>
          {{ entry.item.label }}
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>
