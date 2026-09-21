<script setup lang="ts">
  import {
    Card,
    Center,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    Flex,
    Grid,
    IconButton,
    Inline,
    Ripple,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
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
  <Flex class="group/card relative">
    <Card as-child :padded="false" class="hn-state-layer block w-full hn-interactive hn-press-lg">
      <NuxtLink :to="detailPath">
        <Ripple />

        <Grid v-if="covers.length" :cols="2" class="aspect-3/2 grid-rows-2 gap-0.5 bg-line">
          <Center v-for="i in 4" :key="i" class="overflow-hidden bg-inset">
            <HikariImage
              v-if="covers[i - 1]"
              :src="covers[i - 1]"
              alt=""
              class="size-full"
              image-class="size-full object-cover"
              :processing="{ width: 260, height: 174, fit: 'cover', quality: 68 }"
            >
              <template #empty />
              <template #error />
            </HikariImage>
          </Center>
        </Grid>
        <Center v-else class="aspect-3/2 bg-subtle">
          <Bookmark :size="26" class="text-muted opacity-50" />
        </Center>

        <Stack gap="xs" class="px-3 pt-2.5 pb-3">
          <Inline gap="xs" :wrap="false">
            <Text as="span" size="sm" weight="medium" truncate>{{ collection.name }}</Text>
            <Tag v-if="collection.is_default" class="shrink-0">默认</Tag>
            <Lock v-if="collection.is_private" :size="13" class="shrink-0 text-muted" />
          </Inline>
          <Text as="span" size="xs" tone="muted">{{ collection.item_count }} 项</Text>
        </Stack>
      </NuxtLink>
    </Card>

    <Flex
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
    </Flex>
  </Flex>
</template>
