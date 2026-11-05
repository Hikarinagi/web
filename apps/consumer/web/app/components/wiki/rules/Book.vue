<script setup lang="ts">
  import {
    Container,
    Empty,
    Flex,
    Heading,
    Link,
    Prose,
    ScrollArea,
    SearchInput,
    Select,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { rulePath, sectionName, type RuleSection } from '~/features/wiki/rules'
  import { cn } from '~/utils/cn'
  import type { RulesPageData } from '~~/server/api/pages/create/wiki/rules.get'

  defineOptions({ name: 'WikiRulesBook' })

  const props = defineProps<{ book: RulesPageData; clause: string | null }>()
  const route = useRoute()
  const nav = usePageNav()

  const clauses = computed(() => new Map(props.book.clauses.map(item => [item.id, item])))
  const query = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
  const search = computed({
    get: () => query.value,
    set: value => {
      void nav.query({ q: value.trim() ? value : null }, 'replace')
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
  const current = computed(() =>
    props.clause
      ? props.book.sections.find(
          section => section.id === props.clause || section.clauses.includes(props.clause!),
        )?.id
      : undefined,
  )
  const chapters = computed(() =>
    props.book.sections
      .filter(section => section.level === 2)
      .map(section => ({ value: section.id, label: sectionName(section) })),
  )
  const target = (section: RuleSection) => rulePath(section.clauses[0] ?? section.id)

  function jump(value: unknown) {
    const section = props.book.sections.find(item => item.id === value)
    if (section) void nav.push(target(section))
  }

  function follow(event: MouseEvent) {
    const link = (event.target as HTMLElement | null)?.closest('a')
    const href = link?.getAttribute('href')
    if (!href?.startsWith('/create/wiki/rules/')) return
    event.preventDefault()
    void nav.push(href)
  }
</script>

<template>
  <Flex gap="none" class="h-full min-h-0">
    <ScrollArea class="w-72 shrink-0 border-r border-line bg-surface max-lg:hidden">
      <Stack gap="md" class="p-4">
        <SearchInput v-model="search" placeholder="查找条文" />
        <Stack gap="none">
          <Link
            v-for="section in book.sections"
            :key="section.id"
            :as="NuxtLink"
            :to="target(section)"
            tone="neutral"
            :class="
              cn(
                'block truncate rounded-sm py-1 text-sm',
                section.level === 3 ? 'ps-4' : 'font-medium',
                section.id === current && 'text-accent-text',
              )
            "
          >
            {{ sectionName(section) }}
          </Link>
        </Stack>
      </Stack>
    </ScrollArea>
    <ScrollArea class="min-w-0 flex-1">
      <Container size="md" class="py-8 max-md:py-4">
        <Stack gap="lg" @click="follow">
          <Stack gap="xs">
            <Heading :level="2" size="md">{{ book.title }}</Heading>
            <Text size="sm" tone="muted">{{ book.edition }}</Text>
          </Stack>
          <Stack gap="sm" class="lg:hidden">
            <SearchInput v-model="search" placeholder="查找条文" />
            <Select
              :model-value="current ?? null"
              :options="chapters"
              placeholder="选择章节"
              aria-label="选择章节"
              @update:model-value="jump"
            />
          </Stack>
          <template v-if="query.trim()">
            <Empty v-if="!found.length" :title="`未找到「${query.trim()}」`" />
            <WikiRulesClause
              v-for="item in found"
              :key="item.id"
              :clause="item"
              :active="item.id === clause"
            />
          </template>
          <template v-else>
            <Stack v-for="section in book.sections" :key="section.id" gap="sm">
              <Heading
                :id="`clause-${section.id}`"
                :level="section.level"
                :size="section.level === 2 ? 'sm' : 'xs'"
                class="scroll-mt-4"
              >
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
      </Container>
    </ScrollArea>
  </Flex>
</template>
