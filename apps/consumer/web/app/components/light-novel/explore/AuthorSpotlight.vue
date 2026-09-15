<script setup lang="ts">
  import { Card, Flex, Heading, Inline, Tag, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import type { LightNovelsLandingData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelExploreAuthorSpotlight' })
  const props = defineProps<{
    spotlight: NonNullable<LightNovelsLandingData['author_spotlight']>
  }>()

  const works = computed(() => props.spotlight.works.items.map(row => row.light_novel))
</script>

<template>
  <Flex as="section" direction="col" gap="none" class="gap-5 lg:flex-row lg:items-stretch">
    <Card
      as-child
      :padded="false"
      class="group hn-state-layer flex shrink-0 hn-interactive flex-col gap-2 rounded-xl p-5 hn-press-none lg:w-[240px]"
    >
      <NuxtLink :to="`/light-novels/author/${spotlight.person.id}`">
        <Tag class="w-fit">作者</Tag>
        <Heading :level="3" size="xl">{{ spotlight.person.name }}</Heading>
        <Text size="sm" tone="muted">共 {{ spotlight.works.meta.total_items }} 部作品</Text>
        <Inline
          as="span"
          gap="none"
          :wrap="false"
          class="mt-auto shrink-0 gap-1 text-sm font-medium text-accent-text"
        >
          查看全部
          <ArrowRight class="size-4 transition-transform group-hover:translate-x-0.5" />
        </Inline>
      </NuxtLink>
    </Card>
    <LightNovelExploreRailViewport
      class="lg:-mr-6 lg:ml-0 lg:flex-1"
      content-class="flex min-w-max gap-4 px-6 pb-2 lg:pr-6 lg:pl-0"
    >
      <LightNovelExploreSeriesCard
        v-for="work in works"
        :key="work.id"
        :item="work"
        class="w-[136px]"
      />
    </LightNovelExploreRailViewport>
  </Flex>
</template>
