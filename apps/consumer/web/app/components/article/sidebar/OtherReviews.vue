<script setup lang="ts">
  import { Inline, Link, Panel, Rating, Spoiler, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { workPath } from '#shared/utils/work'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'

  type Group = ArticlePageData['other_reviews'][number]

  defineProps<{ groups: Group[] }>()

  const workTo = (w: Group['work']) => workPath(w.work_type, w.id)
</script>

<template>
  <Panel title="其它人写过这几部" :padded="false">
    <Stack gap="none" class="divide-y divide-line pb-2">
      <Stack
        v-for="g in groups"
        :key="`${g.work.work_type}:${g.work.id}`"
        gap="sm"
        class="px-(--hn-panel-p) py-3"
      >
        <Link :as="NuxtLink" :to="workTo(g.work)" tone="neutral" class="truncate">
          <Text as="span" size="xs" weight="semibold">{{ g.work.title }}</Text>
        </Link>
        <Stack v-for="r in g.reviews" :key="r.id" gap="xs">
          <Inline gap="sm" align="center" :wrap="false">
            <Avatar :user="r.rater" card class="size-5! shrink-0" />
            <UserName :user="r.rater" class="min-w-0 text-xs font-medium text-fg" />
            <Inline v-if="r.rate != null" gap="xs" align="center" :wrap="false" class="ms-auto">
              <Rating :model-value="r.rate" :max="10" :stars="5" readonly size="sm" />
              <Text as="span" size="xs" weight="semibold" class="tabular-nums">
                {{ r.rate.toFixed(1) }}
              </Text>
            </Inline>
          </Inline>
          <Spoiler v-if="r.is_spoiler" class="line-clamp-2 text-xs leading-relaxed text-muted">
            {{ r.rate_content }}
          </Spoiler>
          <Text v-else size="xs" tone="muted" class="line-clamp-2 leading-relaxed">
            {{ r.rate_content }}
          </Text>
        </Stack>
      </Stack>
    </Stack>
  </Panel>
</template>
