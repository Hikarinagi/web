<script setup lang="ts">
  import { Card, Inline, Link, Rating, Space, Spoiler, Stack, Tag, Text } from '@hina-ui/vue'
  import { ArrowRight, Clock, Star } from '@lucide/vue'
  import {
    GALGAME_RATE_DIMENSIONS,
    GALGAME_STATUS_LABEL,
    RATE_HIGHLY_RATED_LIKES,
    type GalgameRateListItem,
  } from '~/features/galgame/rate'
  import { pickRateDimensions } from '~/features/rate/dimensions'
  import { GALGAME_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { useRateVote } from '~/features/galgame/useRateVote'
  import { ratePath } from '~/features/rate/permalink'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'GalgameRatesItem' })
  const props = defineProps<{ rate: GalgameRateListItem; galgameId: number }>()
  const permalink = computed(() => ratePath('GALGAME', props.galgameId, props.rate.id))

  const { vote, votingKind } = useRateVote(props.galgameId)

  const playHours = computed(() =>
    props.rate.time_to_finish_minutes > 0 ? Math.round(props.rate.time_to_finish_minutes / 60) : 0,
  )
  const highlyRated = computed(() => props.rate.like_count >= RATE_HIGHLY_RATED_LIKES)
  const dimensions = computed(() => pickRateDimensions(props.rate, GALGAME_RATE_DIMENSIONS))
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
          v-if="playHours"
          as="span"
          size="xs"
          tone="muted"
          class="inline-flex shrink-0 items-center gap-1"
        >
          <Clock class="size-3" />
          {{ playHours }} 小时
        </Text>
        <Text v-if="playHours" as="span" size="xs" tone="faint">·</Text>
        <Text
          v-if="rate.status"
          as="span"
          size="xs"
          tone="muted"
          class="inline-flex shrink-0 items-center gap-1"
        >
          <component :is="STATUS_ICON[rate.status]" class="size-3" />
          {{ GALGAME_STATUS_LABEL[rate.status] }}
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

      <RateDimensionChips :dimensions="dimensions" />

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

        <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
          <NuxtLink
            v-if="rate.long_review"
            v-slot="{ href, navigate }"
            :to="`/articles/${rate.long_review.id}`"
            custom
          >
            <Link
              :href="href ?? undefined"
              :underline="false"
              class="group inline-flex min-w-0 items-center gap-1 text-xs font-medium"
              @click="navigate"
            >
              <Text as="span" size="xs" weight="medium" truncate>
                {{ rate.long_review.title }}
              </Text>
              <ArrowRight
                class="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </NuxtLink>

          <RateReportMenu
            kind="galgame_rate"
            :work-id="galgameId"
            :rate-id="rate.id"
            :rater-id="rate.rater.id"
          />
        </Inline>
      </Inline>
    </Stack>
  </Card>
</template>
