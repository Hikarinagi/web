<script setup lang="ts">
  import { SearchInput } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderSearchQuery' })

  const { search } = useReader()
  const { query, status, summons } = search
  const field = useTemplateRef<ComponentPublicInstance>('field')

  const input = () => {
    const root: unknown = field.value?.$el
    return root instanceof Element ? root.querySelector('input') : null
  }

  const focusIfEmpty = () => {
    if (!search.query.value.trim()) input()?.focus()
  }

  watch(summons, () => void nextTick(focusIfEmpty))
  onMounted(focusIfEmpty)
</script>

<template>
  <SearchInput
    ref="field"
    v-model="query"
    variant="secondary"
    placeholder="在本书中搜索"
    aria-label="在本书中搜索"
    enterkeyhint="search"
    :loading="status === 'preparing' || status === 'searching'"
    @search="input()?.blur()"
  />
</template>
