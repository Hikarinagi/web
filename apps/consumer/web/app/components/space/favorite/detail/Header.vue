<script setup lang="ts">
  import { ChevronLeft, Lock, Pencil, Trash2 } from '@lucide/vue'
  import type { SpaceCollectionDetailPageData } from '~~/server/api/pages/space/[id]/favorites/[cid].get'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'SpaceFavoriteDetailHeader' })

  const props = defineProps<{
    collection: SpaceCollectionDetailPageData['collection']
    owner: SpaceCollectionDetailPageData['owner']
    isSelf: boolean
    total: number
    ownerId: number
  }>()
  defineEmits<{ edit: []; delete: [] }>()

  const ownerSpacePath = computed(() => `/space/${props.ownerId}`)
  const backPath = computed(() => `${ownerSpacePath.value}?tab=collections`)
  const detailPath = computed(() => `${ownerSpacePath.value}/favorites/${props.collection.id}`)
</script>

<template>
  <div>
    <Button
      as="router-link"
      :to="backPath"
      severity="secondary"
      variant="outlined"
      size="small"
      label="收藏"
      class="mb-4"
    >
      <template #icon><ChevronLeft /></template>
    </Button>

    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <NuxtLink
          :to="ownerSpacePath"
          class="mb-2 inline-flex items-center gap-2 text-sm text-muted-color transition-colors hover:text-color"
        >
          <Avatar
            :user="owner"
            card
            :aria-label="displayName(owner)"
            shape="circle"
            class="size-6! shrink-0 bg-surface-100 dark:bg-surface-800"
            :processing="{ q: 70 }"
          />
          <UserName :user="owner" :handle="false" />
          的收藏夹
        </NuxtLink>
        <div class="flex items-center gap-2">
          <h1 class="truncate text-xl font-semibold text-color">{{ collection.name }}</h1>
          <span
            v-if="collection.is_default"
            class="shrink-0 rounded bg-surface-100 px-1.5 py-0.5 text-[11px] text-muted-color dark:bg-surface-800"
          >
            默认
          </span>
          <Lock v-if="collection.is_private" :size="14" class="shrink-0 text-muted-color" />
        </div>
        <p class="mt-1 text-sm text-muted-color">{{ total }} 项</p>
        <p v-if="collection.description" class="text-color/80 mt-2 text-sm">
          {{ collection.description }}
        </p>
      </div>
      <div class="flex shrink-0 items-stretch gap-1">
        <template v-if="isSelf">
          <Button text size="small" severity="secondary" @click="$emit('edit')">
            <span class="inline-flex items-center gap-1.5">
              <Pencil :size="15" />
              编辑
            </span>
          </Button>
          <Button
            v-if="!collection.is_default"
            text
            size="small"
            severity="secondary"
            @click="$emit('delete')"
          >
            <span class="inline-flex items-center gap-1.5">
              <Trash2 :size="15" />
              删除
            </span>
          </Button>
        </template>
        <ShareButton text severity="secondary" size="small" tooltip="分享" :to="detailPath" />
      </div>
    </div>
  </div>
</template>
