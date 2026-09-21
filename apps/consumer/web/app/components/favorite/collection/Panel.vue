<script setup lang="ts">
  import { Alert, Button, Divider, Inline, ScrollArea, Skeleton, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { useFavoriteCollections } from '~/features/favorite/composables/useFavoriteCollections'
  import type { FavoriteEntityType } from '~/features/favorite/entity'

  defineOptions({ name: 'FavoriteCollectionPanel' })

  const props = withDefaults(
    defineProps<{ type: FavoriteEntityType; id: number; showDone?: boolean; heading?: string }>(),
    { heading: '收藏到收藏夹' },
  )
  const emit = defineEmits<{ done: []; create: [] }>()

  const { rows, pending, failed, savingIds, load, toggleIn } = useFavoriteCollections(
    props.type,
    props.id,
  )

  load()

  async function onToggle(collectionId: number) {
    await toggleIn(collectionId).catch(() => {})
  }
</script>

<template>
  <Stack gap="none" class="h-full min-h-0">
    <Text as="p" weight="semibold" class="px-4 pt-3.5 pb-3 wrap-break-word">{{ heading }}</Text>
    <Divider />

    <ScrollArea v-if="pending" class="min-h-0 flex-1">
      <Stack gap="xs" class="p-2">
        <Inline
          v-for="index in 3"
          :key="index"
          gap="sm"
          align="center"
          :wrap="false"
          class="px-2 py-2.5"
        >
          <Skeleton class="size-4.5 rounded-full" />
          <Skeleton class="h-3 w-36" />
          <Skeleton class="ms-auto h-3 w-7" />
        </Inline>
      </Stack>
    </ScrollArea>

    <Stack v-else-if="failed" gap="sm" align="stretch" class="min-h-0 flex-1 p-4">
      <Alert tone="danger">收藏夹加载失败</Alert>
      <Button variant="ghost" tone="neutral" size="sm" @click="load">重试</Button>
    </Stack>

    <ScrollArea v-else class="min-h-0 flex-1">
      <Stack gap="none" class="p-2">
        <FavoriteCollectionRow
          v-for="row in rows"
          :key="row.id"
          :row="row"
          :saving="savingIds.has(row.id)"
          @toggle="onToggle(row.id)"
        />
      </Stack>
    </ScrollArea>

    <Divider />
    <Button
      variant="ghost"
      tone="accent"
      block
      class="h-auto justify-start px-4 py-3"
      @click="emit('create')"
    >
      <template #icon><Plus /></template>
      新建收藏夹
    </Button>

    <template v-if="showDone">
      <Divider />
      <Stack class="p-3">
        <Button block @click="emit('done')">完成</Button>
      </Stack>
    </template>
  </Stack>
</template>
