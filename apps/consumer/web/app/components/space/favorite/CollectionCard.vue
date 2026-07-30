<script setup lang="ts">
  import { Bookmark, Lock, MoreHorizontal, Pencil, Trash2 } from '@lucide/vue'
  import type { MenuItem } from 'primevue/menuitem'
  import type { SpaceCollectionCard } from '~/features/space/space'

  defineOptions({ name: 'SpaceFavoriteCollectionCard' })

  const props = defineProps<{
    collection: SpaceCollectionCard
    ownerId: number
    isSelf: boolean
  }>()
  const emit = defineEmits<{ edit: []; delete: [] }>()

  const menu = useTemplateRef<{ toggle: (event: Event) => void }>('menu')
  const detailPath = computed(() => `/space/${props.ownerId}/favorites/${props.collection.id}`)
  const covers = computed(() => props.collection.cover_previews.slice(0, 4))

  const menuItems = computed<MenuItem[]>(() => [
    { label: '编辑', iconComponent: Pencil, command: () => emit('edit') },
    { separator: true },
    {
      label: '删除',
      iconComponent: Trash2,
      danger: true,
      disabled: props.collection.is_default,
      command: () => emit('delete'),
    },
  ])

  function openMenu(event: Event) {
    menu.value?.toggle(event)
  }
</script>

<template>
  <div class="group/card relative">
    <NuxtLink
      :to="detailPath"
      class="block overflow-hidden rounded-xl ring-1 ring-surface-200 transition-colors hover:ring-surface-300 dark:ring-surface-700 dark:hover:ring-surface-600"
    >
      <div
        v-if="covers.length"
        class="grid aspect-3/2 grid-cols-2 grid-rows-2 gap-0.5 bg-surface-200 dark:bg-surface-700"
      >
        <div v-for="i in 4" :key="i" class="overflow-hidden bg-surface-100 dark:bg-surface-800">
          <HikariImage
            v-if="covers[i - 1]"
            :src="covers[i - 1]"
            alt=""
            class="size-full"
            image-class="size-full object-cover"
            :processing="{ width: 260, height: 174, fit: 'cover', quality: 68 }"
          >
            <template #empty><span /></template>
            <template #error><span /></template>
          </HikariImage>
        </div>
      </div>
      <div
        v-else
        class="flex aspect-3/2 items-center justify-center bg-surface-50 dark:bg-surface-900"
      >
        <Bookmark :size="26" class="text-muted-color opacity-50" />
      </div>

      <div class="flex flex-col gap-1 px-3 pt-2.5 pb-3">
        <div class="flex items-center gap-1.5">
          <span class="truncate text-sm font-medium text-color">{{ collection.name }}</span>
          <span
            v-if="collection.is_default"
            class="shrink-0 rounded bg-surface-100 px-1.5 py-0.5 text-[11px] text-muted-color dark:bg-surface-800"
          >
            默认
          </span>
          <Lock v-if="collection.is_private" :size="13" class="shrink-0 text-muted-color" />
        </div>
        <span class="text-[13px] text-muted-color">{{ collection.item_count }} 项</span>
      </div>
    </NuxtLink>

    <div
      v-if="isSelf"
      class="absolute top-2 right-2 opacity-100 transition-opacity md:opacity-0 md:group-hover/card:opacity-100 md:focus-within:opacity-100"
    >
      <button
        type="button"
        aria-label="管理收藏夹"
        class="grid size-7 place-items-center rounded-full bg-surface-0/90 text-color shadow-sm ring-1 ring-surface-200 backdrop-blur hover:bg-emphasis dark:bg-surface-900/90 dark:ring-surface-700"
        @click="openMenu"
      >
        <MoreHorizontal :size="16" />
      </button>
      <Menu ref="menu" :model="menuItems" popup :pt="{ list: { class: 'py-1!' } }">
        <template #item="{ item, props: itemProps }">
          <a
            v-bind="itemProps.action"
            :class="[
              'flex items-center gap-2.5 px-3 py-2 text-sm',
              item.danger ? 'text-red-500!' : '',
              item.disabled ? 'pointer-events-none opacity-45' : '',
            ]"
          >
            <component :is="item.iconComponent" class="size-4 shrink-0" aria-hidden="true" />
            <span>{{ item.label }}</span>
          </a>
        </template>
      </Menu>
    </div>
  </div>
</template>
