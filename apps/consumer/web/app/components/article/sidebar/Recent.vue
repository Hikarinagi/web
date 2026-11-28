<script setup lang="ts">
  import { Inline, Link, Panel, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { formatDatePart } from '~/utils/time-format'

  defineProps<{ articles: ArticlePageData['recent_articles'] }>()

  const { t, n } = useLocaleText()
</script>

<template>
  <Panel :title="t('article.recent.title')" :padded="false">
    <Stack gap="none" class="pb-2">
      <Link
        v-for="a in articles"
        :key="a.id"
        :as="NuxtLink"
        :to="`/articles/${a.id}`"
        tone="neutral"
        class="hn-state-layer block hn-interactive px-(--hn-panel-p) py-2.5 hn-press-none"
      >
        <Ripple />
        <Inline gap="md" align="center" :wrap="false">
          <HikariImage
            v-if="a.cover"
            :src="a.cover"
            :alt="a.title"
            class="h-12 w-16 shrink-0 overflow-hidden rounded"
            image-class="size-full object-cover"
            :processing="{ q: 80 }"
          />
          <Stack gap="xs" class="min-w-0 flex-1">
            <Text as="span" size="xs" weight="medium" class="line-clamp-2">{{ a.title }}</Text>
            <Text as="span" size="xs" tone="muted">
              {{
                t('article.recent.meta', {
                  date: formatDatePart(a.created_at, 'monthDay'),
                  views: n(a.view_count),
                })
              }}
            </Text>
          </Stack>
        </Inline>
      </Link>
    </Stack>
  </Panel>
</template>
