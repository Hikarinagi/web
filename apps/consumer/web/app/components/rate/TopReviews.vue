<script setup lang="ts">
  import {
    Card,
    Empty,
    Grid,
    Heading,
    Inline,
    Rating,
    Space,
    Spoiler,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { MessageSquareQuote } from '@lucide/vue'
  import type { UserAvatarData } from '~/types/user'
  import type { NamedUser } from '~/utils/user'

  export interface RateTopReviewItem {
    key: string
    rater: (NamedUser & UserAvatarData) | null
    rate: number | null
    content: string
    isSpoiler: boolean
    badge?: string
  }

  defineOptions({ name: 'RateTopReviews' })
  defineProps<{
    reviews: RateTopReviewItem[]
    total: number
    to: string
  }>()
</script>

<template>
  <Card :padded="false" class="flex min-w-0 flex-1 flex-col rounded-xl">
    <Empty v-if="!reviews.length" size="sm" title="还没有人写短评" class="my-auto">
      <template #icon><MessageSquareQuote /></template>
      <template v-if="$slots.action" #actions><slot name="action" /></template>
    </Empty>

    <template v-else>
      <Heading :level="3" size="sm" class="px-5 pt-4 pb-3 font-bold">热门短评</Heading>

      <Grid :cols="1" gap="none" class="gap-x-6 gap-y-4 px-5 pb-1 sm:grid-cols-2">
        <Inline
          v-for="r in reviews"
          :key="r.key"
          gap="none"
          align="start"
          :wrap="false"
          class="gap-2.5"
        >
          <Avatar :user="r.rater" card class="size-7! shrink-0" />

          <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
            <Inline gap="none" align="center" :wrap="false" class="gap-1.5">
              <UserName :user="r.rater" class="truncate text-xs font-bold" />
              <Text
                v-if="r.badge"
                as="span"
                size="xs"
                weight="medium"
                tone="faint"
                class="shrink-0"
              >
                {{ r.badge }}
              </Text>
              <Space />
              <Inline gap="none" align="center" :wrap="false" class="shrink-0 gap-0.5">
                <Rating :model-value="r.rate ?? 0" :max="10" :stars="5" readonly size="sm" />
                <Text as="span" size="xs" weight="semibold" class="tabular-nums">{{ r.rate }}</Text>
              </Inline>
            </Inline>

            <Text
              as="p"
              size="xs"
              tone="muted"
              class="wrap-anywhere"
              :class="r.isSpoiler ? '' : 'line-clamp-2'"
            >
              <Spoiler v-if="r.isSpoiler" class="line-clamp-2">{{ r.content }}</Spoiler>
              <template v-else>{{ r.content }}</template>
            </Text>
          </Stack>
        </Inline>
      </Grid>

      <ViewAllLink v-if="total > 0" :to="to" class="px-5 pt-3 pb-4">
        查看全部 {{ total }} 条短评
      </ViewAllLink>
    </template>
  </Card>
</template>
