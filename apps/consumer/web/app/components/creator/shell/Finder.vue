<script setup lang="ts">
  import { CommandPalette, Text, type CommandItem } from '@hina-ui/vue'
  import { FINDER_TYPES, describeFound, type WikiSearchItem } from '~/features/wiki/entries'
  import { useWikiDefinitions } from '~/features/wiki/composables/useWikiDefinitions'
  import { useWikiFinder } from '~/features/wiki/composables/useWikiFinder'

  defineOptions({ name: 'CreatorShellFinder' })

  const { open } = useWikiFinder()
  const { typeName } = useWikiDefinitions()
  const route = useRoute()
  const nav = useTabNav()

  watch(
    () => route.query.find,
    find => {
      if (find === '1') open.value = true
    },
    { immediate: true },
  )
  watch(open, next => {
    if (next || route.query.find === undefined) return
    const { find: _find, ...query } = route.query
    void nav.dismiss({ path: route.path, query, hash: route.hash })
  })

  const search = ref('')
  const found = shallowRef<WikiSearchItem[]>([])
  const loading = ref(false)
  let sequence = 0

  watchDebounced(
    search,
    async q => {
      const seq = ++sequence
      const keyword = q.trim()
      if (!keyword) {
        found.value = []
        return
      }
      loading.value = true
      try {
        const items = await hikariRequest('/api/v3/wiki/entries', {
          query: { q: keyword.slice(0, 100), types: [...FINDER_TYPES] },
        })
        if (seq === sequence) found.value = items
      } finally {
        if (seq === sequence) loading.value = false
      }
    },
    { debounce: 250 },
  )

  const items = computed<CommandItem<WikiSearchItem>[]>(() =>
    found.value.map(entry => ({
      id: String(entry.id),
      label: entry.label,
      description: describeFound(entry, typeName(entry.type)),
      data: entry,
      onSelect: () => void navigateTo(`/entries/${entry.id}/edit`),
    })),
  )
</script>

<template>
  <CommandPalette
    v-model:open="open"
    v-model:search="search"
    :items="items"
    :loading="loading"
    hotkey="mod+k"
    ignore-filter
    label="查找条目"
    placeholder="条目名"
  >
    <template #empty="{ search: typed }">
      <Text as="span" size="sm" tone="muted">
        {{ typed.trim() ? `没有找到「${typed.trim()}」` : '输入条目名' }}
      </Text>
    </template>
  </CommandPalette>
</template>
