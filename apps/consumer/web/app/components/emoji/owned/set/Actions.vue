<script setup lang="ts">
  import { Lock, Unlock, MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'

  defineOptions({ name: 'EmojiOwnedSetActions' })

  const props = defineProps<{
    visibilityPublic: boolean
    togglingVisibility: boolean
    deleting: boolean
  }>()
  const emit = defineEmits<{
    'update:visibilityPublic': [value: boolean]
    'edit-request': []
    'delete-request': []
  }>()

  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const menuVisible = ref(false)
  const menuItems = computed<MenuItem[]>(() => [
    {
      label: props.visibilityPublic ? '改为私有' : '公开',
      iconComponent: props.visibilityPublic ? Lock : Unlock,
      disabled: props.togglingVisibility,
      command: () => emit('update:visibilityPublic', !props.visibilityPublic),
    },
    {
      label: '删除贴纸包',
      iconComponent: Trash2,
      danger: true,
      disabled: props.deleting,
      command: () => emit('delete-request'),
    },
  ])

  function toggleMenu(event: MouseEvent) {
    menu.value?.toggle(event)
  }
</script>

<template>
  <div class="relative flex shrink-0 items-center gap-2">
    <Button
      v-tooltip.top="'编辑'"
      aria-label="编辑贴纸包"
      severity="secondary"
      variant="text"
      size="small"
      rounded
      @click="emit('edit-request')"
    >
      <template #icon>
        <Pencil class="size-4" />
      </template>
    </Button>
    <Button
      aria-label="更多操作"
      aria-haspopup="menu"
      :aria-expanded="menuVisible"
      severity="secondary"
      variant="text"
      size="small"
      rounded
      :disabled="deleting"
      @click="toggleMenu"
    >
      <template #icon>
        <MoreHorizontal class="size-4" />
      </template>
    </Button>
    <Menu
      ref="menu"
      :model="menuItems"
      popup
      append-to="self"
      aria-label="贴纸包操作"
      :pt="{
        root: { class: 'top-full! start-auto! end-0! z-50! mt-1! w-44!' },
        list: { class: 'py-1!' },
      }"
      @show="menuVisible = true"
      @hide="menuVisible = false"
    >
      <template #item="{ item, props: itemProps }">
        <a
          v-ripple
          v-bind="itemProps.action"
          :class="['flex items-center gap-2 px-3 py-2 text-sm', item.danger ? 'text-red-500!' : '']"
        >
          <component :is="item.iconComponent" class="size-4 shrink-0" aria-hidden="true" />
          <span class="truncate">{{ item.label }}</span>
        </a>
      </template>
    </Menu>
  </div>
</template>
