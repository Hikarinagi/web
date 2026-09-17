<script setup lang="ts">
  import { SegmentedControl, Stack } from '@hina-ui/vue'
  import { BOOKSHELF_SHELVES, type SpaceBookshelfTabData } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsBookshelf' })

  const props = defineProps<{ userId: number; bookshelf: SpaceBookshelfTabData }>()

  const route = useRoute()
  const router = useRouter()

  const SHELF_OPTIONS = BOOKSHELF_SHELVES.map(shelf => ({ value: shelf.key, label: shelf.label }))

  function selectShelf(value: string | number | undefined) {
    const key = BOOKSHELF_SHELVES.find(shelf => shelf.key === value)?.key
    if (!key || key === props.bookshelf.shelf) return
    void router.replace({
      query: {
        ...route.query,
        page: undefined,
        page_size: undefined,
        shelf: key === 'novel' ? undefined : key,
      },
    })
  }
</script>

<template>
  <Stack gap="lg" class="pt-2">
    <SegmentedControl
      :model-value="bookshelf.shelf"
      :options="SHELF_OPTIONS"
      size="sm"
      aria-label="书架分类"
      class="self-start"
      @update:model-value="selectShelf"
    />

    <SpaceTabsBookshelfNovelShelf v-if="bookshelf.shelf === 'novel'" :bookshelf="bookshelf" />
    <SpaceTabsBookshelfMangaShelf v-else :bookshelf="bookshelf" />
  </Stack>
</template>
