<script setup lang="ts">
  import { Divider, Inline, Skeleton, Stack, Tag, Text } from '@hina-ui/vue'
  import { Search } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { useSearch } from '~/features/search/composables/useSearch'
  import {
    SEARCH_TYPE_LABELS,
    entityHref,
    searchHref,
    searchOptionId,
  } from '~/features/search/search'

  const props = defineProps<{ search: ReturnType<typeof useSearch> }>()
  const emit = defineEmits<{ pick: [string] }>()

  const actionIndex = computed(() => props.search.suggestions.length + props.search.hits.length)
</script>

<template>
  <Stack gap="none">
    <template v-if="search.suggestions.length">
      <Text size="xs" weight="semibold" tone="muted" class="px-3 pt-2.5 pb-1">搜索建议</Text>
      <Inline
        v-for="(s, i) in search.suggestions"
        :id="searchOptionId(i)"
        :key="s.keyword"
        as="button"
        type="button"
        role="option"
        :aria-selected="i === search.activeIndex"
        gap="sm"
        :wrap="false"
        class="hn-state-layer w-full hn-interactive rounded-md px-3 py-2.5 text-left hn-press-none"
        @click="emit('pick', s.keyword)"
      >
        <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ s.keyword }}</Text>
      </Inline>
    </template>

    <Divider
      v-if="search.suggestions.length && (search.hits.length || search.loading)"
      class="my-1"
    />

    <Stack v-if="search.hits.length" gap="xs">
      <NuxtLink
        v-for="(hit, i) in search.hits"
        :id="searchOptionId(search.suggestions.length + i)"
        :key="`${hit.type}-${hit.id}`"
        role="option"
        :aria-selected="search.suggestions.length + i === search.activeIndex"
        :to="entityHref(hit)"
        replace
        class="hn-state-layer flex hn-interactive items-center gap-3 rounded-md px-2.5 py-1.5 hn-press-none"
      >
        <HikariImage
          :src="hit.cover"
          :alt="hit.title"
          :skeleton="false"
          class="h-9 w-7 shrink-0 overflow-hidden rounded bg-inset"
          image-class="object-cover"
        >
          <template #empty><Text as="span" /></template>
        </HikariImage>
        <Text as="span" size="sm" weight="medium" truncate class="min-w-0 flex-1 text-left">
          {{ hit.title }}
        </Text>
        <Tag size="sm" class="shrink-0">{{ SEARCH_TYPE_LABELS[hit.type] }}</Tag>
      </NuxtLink>
    </Stack>

    <Stack v-else-if="search.loading" gap="sm" class="px-2.5 py-2">
      <Inline v-for="i in 3" :key="i" gap="sm" align="center">
        <Skeleton class="h-9 w-7" />
        <Skeleton class="h-3.5 w-3/5" />
      </Inline>
    </Stack>

    <Divider
      v-if="search.suggestions.length || search.hits.length || search.loading"
      class="my-1"
    />
    <ViewAllLink
      v-if="search.hits.length"
      :id="searchOptionId(actionIndex)"
      :to="searchHref(search.query)"
      replace
      role="option"
      :aria-selected="actionIndex === search.activeIndex"
      class="hn-state-layer flex hn-interactive items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent-text hn-press-none"
    >
      <Text as="span" truncate class="min-w-0 flex-1 text-inherit">
        查看全部「{{ search.query }}」的结果
      </Text>
    </ViewAllLink>
    <NuxtLink
      v-else
      :id="searchOptionId(actionIndex)"
      :to="searchHref(search.query)"
      replace
      role="option"
      :aria-selected="actionIndex === search.activeIndex"
      class="hn-state-layer flex hn-interactive items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-accent-text hn-press-none"
    >
      <Search class="size-4 shrink-0" />
      <Text as="span" truncate class="min-w-0 flex-1 text-inherit">搜索「{{ search.query }}」</Text>
    </NuxtLink>
  </Stack>
</template>
