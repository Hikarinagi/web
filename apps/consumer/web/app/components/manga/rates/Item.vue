<script setup lang="ts">
  import { Card, Inline, Link, Rating, Space, Spoiler, Stack, Tag, Text } from '@hina-ui/vue'
  import { Star } from '@lucide/vue'
  import {
    MANGA_STATUS_LABEL,
    RATE_HIGHLY_RATED_LIKES,
    type MangaRateListItem,
  } from '~/features/manga/rate'
  import { MANGA_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { useRateVote } from '~/features/manga/useRateVote'
  import { ratePath } from '~/features/rate/permalink'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'MangaRatesItem' })
  const props = defineProps<{ rate: MangaRateListItem; mangaId: number }>()
  const permalink = computed(() => ratePath('MANGA', props.mangaId, props.rate.id))

  const { vote, votingKind } = useRateVote(props.mangaId)

  const highlyRated = computed(() => props.rate.like_count >= RATE_HIGHLY_RATED_LIKES)
</script>

<template>
  <Card as="article" class="mb-4 break-inside-avoid">
    <Stack gap="sm">
      <Inline gap="sm" align="center" :wrap="false">
        <Avatar :user="rate.rater" card class="size-10! shrink-0" />

        <Inline gap="sm" align="center" wrap class="min-w-0 flex-1">
          <UserName :user="rate.rater" class="text-sm font-medium" />
          <Tag v-if="highlyRated" tone="warning">
            <Star class="fill-warning text-warning" />
            高赞
          </Tag>
        </Inline>

        <Inline v-if="rate.rate != null" gap="xs" align="center" :wrap="false" class="shrink-0">
          <Rating :model-value="rate.rate" :max="10" :stars="5" readonly size="sm" />
          <Text as="span" size="base" weight="semibold" class="tabular-nums">{{ rate.rate }}</Text>
        </Inline>
      </Inline>

      <Inline gap="xs" align="center" wrap>
        <Text
          v-if="rate.status"
          as="span"
          size="xs"
          tone="muted"
          class="inline-flex shrink-0 items-center gap-1"
        >
          <component :is="STATUS_ICON[rate.status]" class="size-3" />
          {{ MANGA_STATUS_LABEL[rate.status] }}
        </Text>
        <Text v-if="rate.status" as="span" size="xs" tone="faint">·</Text>
        <NuxtLink v-slot="{ href, navigate }" :to="permalink" custom>
          <Link
            :href="href ?? undefined"
            tone="neutral"
            :underline="false"
            class="shrink-0 text-xs text-muted"
            @click="navigate"
          >
            {{ timeFromNow(rate.created_at) }}
          </Link>
        </NuxtLink>
      </Inline>

      <Text
        v-if="rate.rate_content"
        as="p"
        size="sm"
        class="leading-relaxed wrap-anywhere whitespace-pre-wrap"
      >
        <Spoiler v-if="rate.is_spoiler">{{ rate.rate_content }}</Spoiler>
        <template v-else>{{ rate.rate_content }}</template>
      </Text>

      <Inline gap="lg" align="center" :wrap="false">
        <Button
          login-required
          variant="ghost"
          :tone="rate.my_value === 1 ? 'accent' : 'neutral'"
          size="sm"
          :loading="votingKind === 'like'"
          :disabled="!!votingKind"
          aria-label="赞"
          @click="vote(rate, 'like')"
        >
          <template #icon><InteractionLikeIcon :active="rate.my_value === 1" /></template>
          {{ rate.like_count }}
        </Button>
        <Button
          login-required
          variant="ghost"
          :tone="rate.my_value === -1 ? 'accent' : 'neutral'"
          size="sm"
          :loading="votingKind === 'dislike'"
          :disabled="!!votingKind"
          aria-label="踩"
          @click="vote(rate, 'dislike')"
        >
          <template #icon><InteractionDislikeIcon :active="rate.my_value === -1" /></template>
          {{ rate.dislike_count }}
        </Button>

        <Space />

        <RateReportMenu
          kind="manga_rate"
          :work-id="mangaId"
          :rate-id="rate.id"
          :rater-id="rate.rater.id"
        />
      </Inline>
    </Stack>
  </Card>
</template>
