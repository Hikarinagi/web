<script setup lang="ts">
  import { Search } from '@lucide/vue'
  import type { useSearch } from '~/features/search/composables/useSearch'
  import {
    SEARCH_TYPE_LABELS,
    entityHref,
    isContentType,
    searchHref,
    searchOptionId,
  } from '~/features/search/search'

  const props = defineProps<{ search: ReturnType<typeof useSearch> }>()
  const emit = defineEmits<{ pick: [string] }>()

  const actionIndex = computed(() => props.search.suggestions.length + props.search.hits.length)
</script>

<template>
  <div class="flex flex-col">
    <template v-if="search.suggestions.length">
      <p class="px-3 pt-2.5 pb-1 text-xs font-semibold text-muted-color">搜索建议</p>
      <Button
        v-for="(s, i) in search.suggestions"
        :id="searchOptionId(i)"
        :key="s.keyword"
        role="option"
        :aria-selected="i === search.activeIndex"
        unstyled
        class="flex w-full items-center rounded-md px-3 py-2.5 text-left"
        :class="i === search.activeIndex ? 'bg-emphasis' : 'hover:bg-emphasis'"
        @click="emit('pick', s.keyword)"
      >
        <span class="truncate text-sm text-color">{{ s.keyword }}</span>
      </Button>
    </template>

    <div
      v-if="search.suggestions.length && (search.hits.length || search.loading)"
      class="mx-3 my-1 border-t border-surface"
    />

    <template v-if="search.hits.length">
      <div class="flex flex-col gap-1">
        <Button
          v-for="(hit, i) in search.hits"
          :id="searchOptionId(search.suggestions.length + i)"
          :key="`${hit.type}-${hit.id}`"
          as="router-link"
          unstyled
          :aria-selected="search.suggestions.length + i === search.activeIndex"
          :to="entityHref(hit)"
          replace
          class="flex items-center gap-3 rounded-md px-2.5 py-1.5 transition-colors"
          :class="
            search.suggestions.length + i === search.activeIndex
              ? 'bg-emphasis'
              : 'hover:bg-emphasis'
          "
        >
          <HikariImage
            v-if="!isContentType(hit.type)"
            :src="hit.cover"
            :alt="hit.title"
            :skeleton="false"
            class="h-9 w-7 shrink-0 overflow-hidden rounded bg-surface-200 dark:bg-surface-800"
            image-class="object-cover"
          >
            <template #empty><span /></template>
          </HikariImage>
          <span class="min-w-0 flex-1 truncate text-sm font-medium text-color">
            {{ hit.title }}
          </span>
          <Tag class="shrink-0 px-1.5 py-0.5 text-[11px]! font-medium">
            {{ SEARCH_TYPE_LABELS[hit.type] }}
          </Tag>
        </Button>
      </div>
    </template>

    <div v-else-if="search.loading" class="flex flex-col gap-2 px-2.5 py-2">
      <div v-for="i in 3" :key="i" class="flex items-center gap-3">
        <Skeleton width="1.75rem" height="2.25rem" />
        <Skeleton width="55%" height="0.9rem" />
      </div>
    </div>

    <div
      v-if="search.suggestions.length || search.hits.length || search.loading"
      class="mx-3 my-1 border-t border-surface"
    />
    <ViewAllLink
      v-if="search.hits.length"
      :id="searchOptionId(actionIndex)"
      :to="searchHref(search.query)"
      as-button
      replace
      role="option"
      :aria-selected="actionIndex === search.activeIndex"
      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors"
      :class="
        actionIndex === search.activeIndex ? 'bg-emphasis' : 'hover:bg-emphasis hover:text-primary'
      "
    >
      <span class="min-w-0 flex-1 truncate">查看全部「{{ search.query }}」的结果</span>
    </ViewAllLink>
    <NuxtLink
      v-else
      :id="searchOptionId(actionIndex)"
      :to="searchHref(search.query)"
      replace
      role="option"
      :aria-selected="actionIndex === search.activeIndex"
      class="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary transition-colors"
      :class="
        actionIndex === search.activeIndex ? 'bg-emphasis' : 'hover:bg-emphasis hover:text-primary'
      "
    >
      <Search class="size-4 shrink-0" />
      <span class="min-w-0 flex-1 truncate">搜索「{{ search.query }}」</span>
    </NuxtLink>
  </div>
</template>
