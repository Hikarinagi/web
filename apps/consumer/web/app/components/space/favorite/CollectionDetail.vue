<script setup lang="ts">
  import { Lock } from '@lucide/vue'
  import type { SpaceCollectionDetailPageData } from '~~/server/api/pages/space/[id]/favorites/[cid].get'
  import { useCollectionDetail } from '~/features/favorite/composables/useCollectionDetail'
  import { COLLECTION_TYPE_FILTERS } from '~/features/space/space'

  defineOptions({ name: 'SpaceFavoriteCollectionDetail' })

  const props = defineProps<{ data: SpaceCollectionDetailPageData }>()

  const {
    collection,
    editOpen,
    activeType,
    list,
    pending,
    loadPage,
    counts,
    chipCount,
    onCollectionSaved,
    confirmRemoveItem,
    confirmDeleteCollection,
  } = useCollectionDetail(props.data)
</script>

<template>
  <div class="py-8">
    <SpaceFavoriteDetailHeader
      :collection="collection"
      :owner="data.owner"
      :is-self="data.is_self"
      :total="counts.total"
      :owner-id="data.owner_id"
      @edit="editOpen = true"
      @delete="confirmDeleteCollection"
    />

    <div class="mt-5 flex flex-wrap items-center gap-2">
      <Button
        v-for="f in COLLECTION_TYPE_FILTERS"
        :key="f.key"
        unstyled
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          activeType === f.key ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'
        "
        @click="activeType = f.key"
      >
        {{ f.label }} {{ chipCount(f.key) }}
      </Button>
    </div>

    <LoadingOverlay
      v-if="list.items.length"
      class="mt-5"
      :loading="pending"
      content-class="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-5"
    >
      <SpaceFavoriteItemCard
        v-for="item in list.items"
        :key="`${item.type}:${item.id}`"
        :item="item"
        :is-self="data.is_self"
        @remove="confirmRemoveItem(item)"
      />
    </LoadingOverlay>
    <SpaceEmptyState v-else :icon="Lock" text="这个分类下还没有收藏" />

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      align="center"
      class="pt-6"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />

    <SpaceFavoriteEditDialog
      v-if="data.is_self"
      v-model:visible="editOpen"
      :collection="collection"
      @saved="onCollectionSaved"
    />
  </div>
</template>
