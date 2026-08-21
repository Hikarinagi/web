<script setup lang="ts">
  import { BOOKSHELF_SHELVES, type SpaceBookshelfTabData } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsBookshelf' })

  const props = defineProps<{ userId: number; bookshelf: SpaceBookshelfTabData }>()

  const route = useRoute()
  const router = useRouter()

  function selectShelf(key: (typeof BOOKSHELF_SHELVES)[number]['key']) {
    if (key === props.bookshelf.shelf) return
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
  <div class="flex flex-col gap-5 pt-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-for="s in BOOKSHELF_SHELVES"
        :key="s.key"
        unstyled
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          bookshelf.shelf === s.key
            ? 'bg-primary/10 text-primary'
            : 'text-muted-color hover:text-color'
        "
        @click="selectShelf(s.key)"
      >
        {{ s.label }}
      </Button>
    </div>

    <SpaceTabsBookshelfNovelShelf v-if="bookshelf.shelf === 'novel'" :bookshelf="bookshelf" />
    <SpaceTabsBookshelfMangaShelf v-else :bookshelf="bookshelf" />
  </div>
</template>
