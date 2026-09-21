<script setup lang="ts">
  import {
    Container,
    Empty,
    Grid,
    Heading,
    Inline,
    Section,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { SearchX } from '@lucide/vue'
  import type { SearchPageData } from '~~/server/api/pages/search.get'
  import { searchRoute } from '~/features/search/results'
  import { useSearchResults } from '~/features/search/composables/useSearchResults'
  import { SEARCH_TYPES, SEARCH_TYPE_LABELS, type SearchType } from '~/features/search/search'

  defineOptions({ name: 'SearchResultsShell' })

  const props = defineProps<{ initial: SearchPageData }>()

  const { displayed, state, pending, update } = useSearchResults(props.initial)

  const ALL = 'all'

  function isEntity(type: SearchType) {
    return type === 'character' || type === 'person' || type === 'producer'
  }

  function gridClass(type: SearchType) {
    return isEntity(type)
      ? 'grid-cols-3 sm:grid-cols-5 lg:grid-cols-8'
      : 'grid-cols-3 sm:grid-cols-4 lg:grid-cols-6'
  }

  function typeRoute(type: SearchType) {
    return searchRoute({ ...state.value, types: [type], page: 1 })
  }

  const typedType = computed<SearchType | undefined>(() => state.value.types[0])
  const scope = computed(() => typedType.value ?? ALL)

  function selectScope(value?: string) {
    const next = value ?? ALL
    update({ types: next === ALL ? [] : [next as SearchType], page: 1 })
  }

  const empty = computed(() =>
    state.value.q
      ? {
          title: `没有找到与「${state.value.q}」匹配的内容`,
          description: '换一个关键词，或者切换搜索范围',
        }
      : { title: '输入关键词开始搜索', description: '可以搜索作品、角色、人物与厂商' },
  )
</script>

<template>
  <Container size="lg" class="py-10">
    <Stack gap="lg">
      <Inline align="baseline" gap="sm">
        <Heading :level="1" size="2xl">
          <template v-if="state.q">「{{ state.q }}」的搜索结果</template>
          <template v-else>搜索</template>
        </Heading>
        <Text as="span" size="sm" tone="muted" class="tabular-nums">
          共 {{ displayed.total }} 项
        </Text>
      </Inline>

      <Tabs :model-value="scope" @update:model-value="selectScope">
        <TabsList label="搜索范围">
          <TabsTrigger :value="ALL">全部</TabsTrigger>
          <TabsTrigger v-for="type in SEARCH_TYPES" :key="type" :value="type">
            {{ SEARCH_TYPE_LABELS[type] }}
          </TabsTrigger>
        </TabsList>

        <TabsContent :value="scope" class="pt-6">
          <Stack gap="none" class="relative">
            <Stack v-if="displayed.groups.length" gap="xl">
              <Section v-for="group in displayed.groups" :key="group.type">
                <Inline align="center" gap="sm" :wrap="false">
                  <Heading :level="2" size="base">{{ SEARCH_TYPE_LABELS[group.type] }}</Heading>
                  <Text as="span" size="sm" tone="muted" class="tabular-nums">
                    {{ group.total }}
                  </Text>
                  <ViewAllLink
                    v-if="group.total > group.items.length"
                    :to="typeRoute(group.type)"
                    class="ms-auto"
                  >
                    查看全部 {{ group.total }} 个
                  </ViewAllLink>
                </Inline>
                <Grid class="gap-x-4 gap-y-6" :class="gridClass(group.type)">
                  <SearchResultsItem
                    v-for="hit in group.items"
                    :key="`${hit.type}-${hit.id}`"
                    :hit="hit"
                  />
                </Grid>
              </Section>
            </Stack>

            <Stack
              v-else-if="displayed.list && displayed.list.items.length"
              id="search-results"
              gap="lg"
            >
              <Grid class="gap-x-4 gap-y-6" :class="typedType ? gridClass(typedType) : ''">
                <SearchResultsItem
                  v-for="hit in displayed.list.items"
                  :key="`${hit.type}-${hit.id}`"
                  :hit="hit"
                />
              </Grid>
              <Paginator
                :meta="displayed.list.meta"
                route="push"
                align="center"
                scroll-target="#search-results"
              />
            </Stack>

            <Empty v-else :title="empty.title" :description="empty.description">
              <template #icon><SearchX /></template>
            </Empty>

            <LoadingOverlay :visible="pending" />
          </Stack>
        </TabsContent>
      </Tabs>
    </Stack>
  </Container>
</template>
