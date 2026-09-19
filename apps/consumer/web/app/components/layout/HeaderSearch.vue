<script setup lang="ts">
  import { Dialog, Divider, IconButton, SearchInput, Stack } from '@hina-ui/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import { Search } from '@lucide/vue'
  import { useSearch } from '~/features/search/composables/useSearch'
  import { useSearchControls } from '~/features/search/composables/useSearchControls'
  import { useSearchOverlay } from '~/features/search/composables/useSearchOverlay'
  import { SEARCH_LISTBOX_ID, searchOptionId } from '~/features/search/search'

  defineOptions({ name: 'LayoutHeaderSearch' })

  const search = useSearch()
  const { open, show, close } = useSearchOverlay()
  const { onKeydown, onPick } = useSearchControls(search)
  const isMobile = useBreakpoints(breakpointsTailwind).smaller('md')

  const activeOptionId = computed(() =>
    search.activeIndex >= 0 ? searchOptionId(search.activeIndex) : undefined,
  )

  const mounted = useMounted()
  const triggerLabel = computed(() =>
    mounted.value ? `搜索（${/Mac/i.test(navigator.userAgent) ? '⌘K' : 'Ctrl+K'}）` : '搜索',
  )

  onKeyStroke(['k', 'K'], event => {
    if (event.repeat || event.defaultPrevented) return
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return
    event.preventDefault()
    show()
  })

  watch(open, opened => {
    if (!opened) return
    search.reset()
    void search.loadTrending()
  })
</script>

<template>
  <IconButton :label="triggerLabel" pill @click="show">
    <Search />
  </IconButton>

  <Dialog
    title="搜索"
    placement="top"
    size="lg"
    :header="false"
    :open="open && !isMobile"
    @update:open="value => !value && close()"
  >
    <template #body>
      <Stack gap="none" class="min-h-0">
        <SearchInput
          v-model="search.query"
          variant="bare"
          size="lg"
          :loading="search.loading"
          aria-label="搜索"
          placeholder="搜索作品 / 角色 / 人物…"
          role="combobox"
          aria-expanded="true"
          aria-autocomplete="list"
          :aria-controls="SEARCH_LISTBOX_ID"
          :aria-activedescendant="activeOptionId"
          class="shrink-0"
          @keydown="onKeydown"
        />
        <Divider />
        <SearchPanel :search="search" @pick="onPick" />
      </Stack>
    </template>
  </Dialog>

  <SearchMobile :search="search" :open="open && isMobile" @close="close" />
</template>
