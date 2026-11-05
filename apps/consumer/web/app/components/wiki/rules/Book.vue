<script setup lang="ts">
  import {
    Flex,
    Heading,
    Link,
    Prose,
    ScrollArea,
    SearchInput,
    Stack,
    Text,
    Empty,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { rulePath, sectionName } from '~/features/wiki/rules'
  import { cn } from '~/utils/cn'
  import type { RulesPageData } from '~~/server/api/pages/create/wiki/rules.get'

  defineOptions({ name: 'WikiRulesBook' })

  const props = defineProps<{ book: RulesPageData; clause: string | null }>()
  const route = useRoute()
  const router = useRouter()

  const clauses = computed(() => new Map(props.book.clauses.map(item => [item.id, item])))
  const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
  const search = computed({
    get: () => query.value,
    set: value => {
      const { q: _q, ...rest } = route.query
      void router.replace({ query: value.trim() ? { ...rest, q: value } : rest })
    },
  })
  const found = computed(() => {
    const keyword = query.value.trim().toLowerCase()
    return keyword
      ? props.book.clauses.filter(
          item => item.id.toLowerCase() === keyword || item.text.toLowerCase().includes(keyword),
        )
      : []
  })

  function follow(event: MouseEvent) {
    const link = (event.target as HTMLElement | null)?.closest('a')
    const href = link?.getAttribute('href')
    if (!href?.startsWith('/create/wiki/rules/')) return
    event.preventDefault()
    void router.push(href)
  }
</script>

<template>
  <Flex gap="lg" align="start">
    <Stack
      gap="sm"
      class="sticky top-0 h-[calc(100dvh-var(--hn-app-shell-header-h)-var(--spacing)*20)] w-64 shrink-0 max-lg:hidden"
    >
      <SearchInput v-model="search" placeholder="查找条文" />
      <ScrollArea class="min-h-0 flex-1">
        <Stack gap="xs" class="pr-2">
          <Link
            v-for="section in book.sections"
            :key="section.id"
            :as="NuxtLink"
            :to="section.clauses[0] ? rulePath(section.clauses[0]) : rulePath(section.id)"
            tone="neutral"
            :class="cn('text-sm', section.level === 3 && 'ps-4 text-muted')"
          >
            {{ sectionName(section) }}
          </Link>
        </Stack>
      </ScrollArea>
    </Stack>
    <Stack gap="lg" class="min-w-0 flex-1" @click="follow">
      <Stack gap="xs">
        <Heading :level="2" size="md">{{ book.title }}</Heading>
        <Text size="sm" tone="muted">{{ book.edition }}</Text>
      </Stack>
      <SearchInput v-model="search" placeholder="查找条文" class="lg:hidden" />
      <template v-if="query.trim()">
        <Empty v-if="!found.length" :title="`没有找到「${query.trim()}」`" />
        <WikiRulesClause
          v-for="item in found"
          :key="item.id"
          :clause="item"
          :active="item.id === clause"
        />
      </template>
      <template v-else>
        <Stack v-for="section in book.sections" :key="section.id" gap="sm">
          <Heading :id="`clause-${section.id}`" :level="section.level" size="sm">
            {{ sectionName(section) }}
          </Heading>
          <Prose v-if="section.intro" as-child><div v-html="section.intro" /></Prose>
          <WikiRulesClause
            v-for="id in section.clauses"
            :key="id"
            :clause="clauses.get(id)!"
            :active="id === clause"
          />
        </Stack>
      </template>
    </Stack>
  </Flex>
</template>
