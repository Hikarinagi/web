<script setup lang="ts">
  import { Ellipsis, Eye, Pencil, ThumbsUp, Trash2 } from '@lucide/vue'
  import type Menu from 'primevue/menu'
  import type { MenuItem } from 'primevue/menuitem'
  import type { Component } from 'vue'
  import {
    formatMonthDay,
    managedEditLabel,
    managedStatusBadge,
    managedTypeLabel,
    managedViewPath,
    type ManagedContentItem,
  } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsContentManageRow' })

  const props = defineProps<{ item: ManagedContentItem }>()
  const emit = defineEmits<{
    edit: [item: ManagedContentItem]
    remove: [item: ManagedContentItem]
  }>()

  interface ActionItem extends MenuItem {
    iconComponent: Component
    danger?: boolean
    action: () => void
  }

  const router = useRouter()
  const menu = ref<InstanceType<typeof Menu> | null>(null)
  const menuOpen = ref(false)
  const badge = computed(() => managedStatusBadge(props.item.status))
  const menuItems = computed<ActionItem[]>(() => {
    const items: ActionItem[] = [
      {
        label: managedEditLabel(props.item),
        iconComponent: Pencil,
        action: () => {
          menu.value?.hide()
          emit('edit', props.item)
        },
      },
    ]

    if (props.item.status === 'PUBLISHED') {
      items.push({
        label: '查看',
        iconComponent: Eye,
        action: () => {
          menu.value?.hide()
          void router.push(managedViewPath(props.item))
        },
      })
    }

    items.push({
      label: '删除',
      iconComponent: Trash2,
      danger: true,
      action: () => {
        menu.value?.hide()
        emit('remove', props.item)
      },
    })

    return items
  })

  function toggleMenu(event: MouseEvent) {
    menu.value?.toggle(event)
  }
</script>

<template>
  <div
    class="flex items-center gap-4 border-b border-surface-100 py-3.5 last:border-b-0 dark:border-surface-800/60"
  >
    <HikariImage
      :src="item.cover?.src"
      :alt="item.title"
      class="h-14 w-20 shrink-0 rounded-md bg-surface-100 dark:bg-surface-800"
      image-class="size-full object-cover"
      :processing="{ width: 160, height: 112, fit: 'cover', quality: 80 }"
    />
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <div class="flex min-w-0 items-center gap-2">
        <Tag
          :value="badge?.label"
          :severity="badge?.severity"
          :pt="{ root: { class: 'text-[11px]! shrink-0' } }"
        />
        <p class="truncate font-medium text-color">{{ item.title || '未命名草稿' }}</p>
      </div>
      <div class="flex items-center gap-3.5 text-xs text-muted-color">
        <span>{{ managedTypeLabel(item) }}</span>
        <span class="flex items-center gap-1">
          <Eye class="size-3.5" />
          {{ item.view_count }}
        </span>
        <span class="flex items-center gap-1">
          <ThumbsUp class="size-3.5" />
          {{ item.like_count }}
        </span>
        <span>{{ formatMonthDay(item.updated_at) }}</span>
      </div>
    </div>
    <div class="hidden shrink-0 items-center gap-1 sm:flex">
      <Button :label="managedEditLabel(item)" text size="small" @click="emit('edit', item)" />
      <Button
        v-if="item.status === 'PUBLISHED'"
        as="router-link"
        :to="managedViewPath(item)"
        label="查看"
        text
        severity="secondary"
        size="small"
      />
      <Button label="删除" text severity="danger" size="small" @click="emit('remove', item)" />
    </div>
    <Button
      text
      severity="secondary"
      size="small"
      aria-label="更多操作"
      aria-haspopup="menu"
      :aria-expanded="menuOpen"
      class="shrink-0 sm:hidden!"
      @click="toggleMenu"
    >
      <template #icon><Ellipsis class="size-4" /></template>
    </Button>
    <Menu
      ref="menu"
      :model="menuItems"
      popup
      aria-label="文章操作"
      :pt="{ list: { class: 'py-1!' } }"
      @show="menuOpen = true"
      @hide="menuOpen = false"
    >
      <template #item="{ item: option }">
        <Button
          unstyled
          class="flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="option.danger ? 'text-red-500' : 'text-color'"
          @click="option.action"
        >
          <component :is="option.iconComponent" class="size-4 shrink-0" />
          <span>{{ option.label }}</span>
        </Button>
      </template>
    </Menu>
  </div>
</template>
