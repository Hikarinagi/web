<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ChevronLeft, Lock, Pencil, Trash2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
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
  <Stack gap="md">
    <Button :as="NuxtLink" :to="backPath" variant="outline" tone="neutral" size="sm" class="w-fit">
      <template #icon><ChevronLeft /></template>
      收藏
    </Button>

    <Inline gap="md" align="start" justify="between" :wrap="false">
      <Stack gap="xs" class="min-w-0">
        <NuxtLink
          :to="ownerSpacePath"
          class="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-fg"
        >
          <Avatar
            :user="owner"
            card
            :aria-label="displayName(owner)"
            class="size-6! shrink-0 bg-inset"
            :processing="{ q: 70 }"
          />
          <UserName :user="owner" :handle="false" />
          的收藏夹
        </NuxtLink>
        <Inline gap="sm" :wrap="false">
          <Heading :level="1" size="xl" truncate>{{ collection.name }}</Heading>
          <Tag v-if="collection.is_default" class="shrink-0">默认</Tag>
          <Lock v-if="collection.is_private" :size="14" class="shrink-0 text-muted" />
        </Inline>
        <Text size="sm" tone="muted">{{ total }} 项</Text>
        <Text v-if="collection.description" size="sm">{{ collection.description }}</Text>
      </Stack>

      <Inline gap="xs" align="stretch" class="shrink-0" :wrap="false">
        <template v-if="isSelf">
          <Button variant="ghost" tone="neutral" size="sm" @click="$emit('edit')">
            <template #icon><Pencil /></template>
            编辑
          </Button>
          <Button
            v-if="!collection.is_default"
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="$emit('delete')"
          >
            <template #icon><Trash2 /></template>
            删除
          </Button>
        </template>
        <ShareButton size="sm" tooltip="分享" :to="detailPath" />
      </Inline>
    </Inline>
  </Stack>
</template>
