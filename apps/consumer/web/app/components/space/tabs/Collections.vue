<script setup lang="ts">
  import { Bookmark, Plus } from '@lucide/vue'
  import { useCollectionManage } from '~/features/favorite/composables/useCollectionManage'
  import type { SpaceCollectionCard } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsCollections' })

  const props = defineProps<{
    userId: number
    isSelf: boolean
    collections: SpaceCollectionCard[]
  }>()

  const { collections, dialogOpen, editing, openCreate, openEdit, onSaved, confirmRemove } =
    useCollectionManage(props.collections)

  const emptyText = computed(() =>
    props.isSelf ? '还没有收藏夹,新建一个开始收藏吧' : 'TA 还没有公开的收藏夹',
  )
</script>

<template>
  <div class="flex flex-col gap-4 pt-2">
    <div v-if="collections.length || isSelf" class="flex items-center gap-3">
      <span class="flex-1 text-sm text-muted-color">{{ collections.length }} 个收藏夹</span>
      <Button v-if="isSelf" size="small" @click="openCreate">
        <span class="inline-flex items-center gap-1.5">
          <Plus :size="16" />
          新建收藏夹
        </span>
      </Button>
    </div>

    <div
      v-if="collections.length"
      class="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 lg:grid-cols-4"
    >
      <SpaceFavoriteCollectionCard
        v-for="collection in collections"
        :key="collection.id"
        :collection="collection"
        :owner-id="userId"
        :is-self="isSelf"
        @edit="openEdit(collection)"
        @delete="confirmRemove(collection)"
      />
    </div>

    <SpaceEmptyState v-else :icon="Bookmark" :text="emptyText" />

    <SpaceFavoriteEditDialog
      v-if="isSelf"
      v-model:visible="dialogOpen"
      :collection="editing"
      @saved="onSaved"
    />
  </div>
</template>
