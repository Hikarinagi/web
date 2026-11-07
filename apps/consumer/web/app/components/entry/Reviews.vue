<script setup lang="ts">
  import {
    Button as HnButton,
    Card,
    Empty,
    Inline,
    LineClamp,
    Spoiler,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { PenLine, Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LikeKind } from '~/features/interaction/useLike'
  import type { UserAvatarData } from '~/types/user'
  import type { NamedUser } from '~/utils/user'

  export interface EntryReview {
    id: number
    score: number | null
    text: string
    spoiler: boolean
    rater: (NamedUser & UserAvatarData) | null
    status?: string
    hours?: number
    likes: number
    liked: boolean
    date: string
  }

  defineOptions({ name: 'EntryReviews' })
  defineProps<{
    reviews: EntryReview[]
    count: number
    to: string
    likeKind: LikeKind
    workId: number
  }>()
  defineEmits<{ write: [] }>()

  const details = (review: EntryReview) =>
    [review.status, review.hours ? `${review.hours} 小时` : '', review.date].filter(Boolean)
</script>

<template>
  <EntrySectionHead id="reviews" title="短评" :count="count">
    <template v-if="reviews.length" #actions>
      <Inline gap="xs">
        <Button login-required variant="ghost" tone="neutral" size="sm" @click="$emit('write')">
          <template #icon><PenLine /></template>
          写短评
        </Button>
        <HnButton v-if="count > 4" :as="NuxtLink" :to="to" variant="ghost" tone="neutral" size="sm">
          全部短评
        </HnButton>
      </Inline>
    </template>
  </EntrySectionHead>
  <ScrollRail v-if="reviews.length" class="-mx-4 -my-1 md:-mx-1">
    <Inline
      gap="sm"
      align="stretch"
      :wrap="false"
      class="w-max px-4 py-1 md:grid md:w-full md:grid-cols-2 md:px-1"
    >
      <Card
        v-for="review in reviews.slice(0, 4)"
        :key="review.id"
        class="w-(--card-review) shrink-0 md:w-auto"
      >
        <Stack gap="sm" class="h-full">
          <Inline gap="sm" align="center" :wrap="false">
            <Avatar :user="review.rater" card size="sm" />
            <Stack gap="none" class="min-w-0 flex-1">
              <UserName :user="review.rater" class="truncate text-sm font-medium" />
              <Inline gap="sm" align="center" :wrap="false">
                <Text
                  v-for="part in details(review)"
                  :key="part"
                  as="span"
                  size="xs"
                  tone="muted"
                  class="tabular-nums"
                >
                  {{ part }}
                </Text>
              </Inline>
            </Stack>
            <Inline
              v-if="review.score !== null"
              gap="xs"
              align="center"
              :wrap="false"
              class="rounded-full bg-subtle px-2 py-0.5"
            >
              <Star class="size-3.5 fill-current text-warning" />
              <Text size="sm" weight="semibold" class="tabular-nums">{{ review.score }}</Text>
            </Inline>
          </Inline>
          <Spoiler v-if="review.spoiler" class="flex-1 text-sm leading-relaxed">
            {{ review.text }}
          </Spoiler>
          <LineClamp v-else :lines="3" expand-label="展开" collapse-label="收起" class="flex-1">
            <Text size="sm" class="leading-relaxed wrap-anywhere whitespace-pre-line">
              {{ review.text }}
            </Text>
          </LineClamp>
          <EntryReviewLike
            :kind="likeKind"
            :rate-id="review.id"
            :work-id="workId"
            :likes="review.likes"
            :liked="review.liked"
          />
        </Stack>
      </Card>
    </Inline>
  </ScrollRail>
  <Card v-else>
    <Empty title="暂无短评" size="sm">
      <template #actions>
        <Button login-required variant="soft" tone="neutral" size="sm" @click="$emit('write')">
          <template #icon><PenLine /></template>
          写短评
        </Button>
      </template>
    </Empty>
  </Card>
</template>
