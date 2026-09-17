<script setup lang="ts">
  import { Button, Inline, SimpleGrid, Stack, Text } from '@hina-ui/vue'
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
    props.isSelf ? '还没有收藏夹，新建一个开始收藏吧' : 'TA 还没有公开的收藏夹',
  )
</script>

<template>
  <Stack gap="md" class="pt-2">
    <Inline v-if="collections.length || isSelf" gap="sm" justify="between">
      <Text size="sm" tone="muted">{{ collections.length }} 个收藏夹</Text>
      <Button v-if="isSelf" size="sm" @click="openCreate">
        <template #icon><Plus /></template>
        新建收藏夹
      </Button>
    </Inline>

    <SimpleGrid v-if="collections.length" min="11rem" gap="md">
      <SpaceFavoriteCollectionCard
        v-for="collection in collections"
        :key="collection.id"
        :collection="collection"
        :owner-id="userId"
        :is-self="isSelf"
        @edit="openEdit(collection)"
        @delete="confirmRemove(collection)"
      />
    </SimpleGrid>

    <SpaceEmptyState v-else :icon="Bookmark" :text="emptyText" />

    <SpaceFavoriteEditDialog
      v-if="isSelf"
      v-model:visible="dialogOpen"
      :collection="editing"
      @saved="onSaved"
    />
  </Stack>
</template>
