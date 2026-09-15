<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton } from '@hina-ui/vue'
  import { Bookmark, Ellipsis, Lock, Pencil, Trash2 } from '@lucide/vue'
  import type { SpaceCollectionCard } from '~/features/space/space'

  defineOptions({ name: 'SpaceFavoriteCollectionCard' })

  const props = defineProps<{
    collection: SpaceCollectionCard
    ownerId: number
    isSelf: boolean
  }>()
  const emit = defineEmits<{ edit: []; delete: [] }>()

  const detailPath = computed(() => `/space/${props.ownerId}/favorites/${props.collection.id}`)
  const covers = computed(() => props.collection.cover_previews.slice(0, 4))
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
      <DropdownMenu label="管理收藏夹" align="end" class="w-32">
        <IconButton
          label="管理收藏夹"
          variant="soft"
          tone="neutral"
          size="sm"
          pill
          class="bg-surface/90 shadow-sm ring-1 ring-line backdrop-blur"
        >
          <Ellipsis />
        </IconButton>
        <template #content>
          <DropdownMenuItem @select="emit('edit')">
            <template #icon><Pencil /></template>
            编辑
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            tone="danger"
            :disabled="collection.is_default"
            @select="emit('delete')"
          >
            <template #icon><Trash2 /></template>
            删除
          </DropdownMenuItem>
        </template>
      </DropdownMenu>
    </div>
  </div>
</template>
