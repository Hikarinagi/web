<script setup lang="ts">
  import { Card, Heading, Inline, Rating, Ripple, Stack, Text } from '@hina-ui/vue'
  import { Eye, Heart } from '@lucide/vue'
  import type { BackendWorkArticleList } from '~/features/work/article'

  defineOptions({ name: 'WorkLongReviews' })
  defineProps<{ articles: BackendWorkArticleList }>()

  const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k` : `${n}`)
</script>

<template>
  <WorkSection
    title="长评"
    :meta="`${articles.meta.total_items} 篇`"
    :empty="!articles.items.length"
    hide-when-empty
  >
    <Stack gap="md">
      <Card
        v-for="a in articles.items"
        :key="a.id"
        as-child
        :padded="false"
        class="hn-state-layer flex hn-interactive flex-col gap-3 rounded-xl px-6 py-5 hn-press-lg"
      >
        <NuxtLink :to="`/articles/${a.id}`">
          <Ripple />

          <Inline align="center" gap="sm">
            <Avatar :user="a.creator" card class="size-6! shrink-0" />
            <UserName :user="a.creator" class="text-sm font-medium" />
            <Inline v-if="a.rate != null" as="span" gap="xs" :wrap="false" class="text-sm">
              <Rating :model-value="a.rate" :max="10" :stars="5" readonly size="sm" />
              <Text as="span" size="sm" weight="semibold" class="tabular-nums">
                {{ a.rate }}/10
              </Text>
            </Inline>
          </Inline>

          <Heading :level="3" size="lg" class="wrap-anywhere">{{ a.title }}</Heading>

          <Text v-if="a.excerpt" size="sm" tone="muted" class="line-clamp-2 leading-relaxed">
            {{ a.excerpt }}
          </Text>

          <Inline align="center" gap="none" class="gap-4">
            <Text as="span" size="xs" tone="muted" class="inline-flex items-center gap-1">
              <Eye class="size-3.5" />
              {{ fmt(a.view_count) }}
            </Text>
            <Text as="span" size="xs" tone="muted" class="inline-flex items-center gap-1">
              <Heart class="size-3.5" />
              {{ fmt(a.like_count) }}
            </Text>
          </Inline>
        </NuxtLink>
      </Card>
    </Stack>
  </WorkSection>
</template>
