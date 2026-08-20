<script setup lang="ts">
  import type { SearchPageData } from '~~/server/api/pages/search.get'
  import { searchRoute } from '~/features/search/results'
  import { useSearchResults } from '~/features/search/composables/useSearchResults'
  import { SEARCH_TYPE_LABELS, isContentType, type SearchType } from '~/features/search/search'

  defineOptions({ name: 'SearchResultsShell' })

  const props = defineProps<{ initial: SearchPageData }>()

  const { displayed, state, pending, update } = useSearchResults(props.initial)

  function isEntity(type: SearchType) {
    return type === 'character' || type === 'person' || type === 'producer'
  }

  function gridClass(type: SearchType) {
    if (isContentType(type)) return 'grid-cols-1 sm:grid-cols-2'
    return isEntity(type)
      ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8'
      : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'
  }

  function typeRoute(type: SearchType) {
    return searchRoute({ ...state.value, types: [type], page: 1 })
  }

  const typedType = computed<SearchType | undefined>(() => state.value.types[0])
</script>

<template>
  <div class="mx-auto flex max-w-app flex-col gap-6 px-6 py-10">
    <div class="flex items-center gap-2">
      <h1 class="text-2xl font-bold text-color">
        <template v-if="state.q">「{{ state.q }}」的搜索结果</template>
        <template v-else>搜索</template>
      </h1>
      <p class="text-sm text-muted-color">共 {{ displayed.total }} 项</p>
    </div>

    <SearchResultsFilters :state="state" @update="update" />

    <LoadingOverlay :loading="pending">
      <div v-if="displayed.groups.length" class="flex flex-col gap-8">
        <section v-for="group in displayed.groups" :key="group.type" class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <h2 class="text-base font-semibold text-color">
              {{ SEARCH_TYPE_LABELS[group.type] }}
            </h2>
            <span class="text-sm text-muted-color">{{ group.total }}</span>
            <ViewAllLink
              v-if="group.total > group.items.length"
              :to="typeRoute(group.type)"
              class="ml-auto"
            >
              查看全部 {{ group.total }} 个
            </ViewAllLink>
          </div>
          <div class="grid gap-x-4 gap-y-6" :class="gridClass(group.type)">
            <SearchResultsItem
              v-for="hit in group.items"
              :key="`${hit.type}-${hit.id}`"
              :hit="hit"
            />
          </div>
        </section>
      </div>

      <div
        v-else-if="displayed.list && displayed.list.items.length"
        id="search-results"
        class="flex flex-col gap-6"
      >
        <div class="grid gap-x-4 gap-y-6" :class="typedType ? gridClass(typedType) : ''">
          <SearchResultsItem
            v-for="hit in displayed.list.items"
            :key="`${hit.type}-${hit.id}`"
            :hit="hit"
          />
        </div>

        <Paginator
          :meta="displayed.list.meta"
          route="push"
          align="center"
          scroll-target="#search-results"
        />
      </div>

      <p v-else class="py-16 text-center text-sm text-muted-color">
        <template v-if="state.q">没有找到与「{{ state.q }}」匹配的内容</template>
        <template v-else>输入关键词，搜索作品 / 角色 / 人物</template>
      </p>
    </LoadingOverlay>
  </div>
</template>
