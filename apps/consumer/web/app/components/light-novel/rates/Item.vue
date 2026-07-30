<script setup lang="ts">
  import { BookText, Clock, Star } from '@lucide/vue'
  import {
    LIGHT_NOVEL_RATE_DIMENSIONS,
    LIGHT_NOVEL_STATUS_LABEL,
    RATE_HIGHLY_RATED_LIKES,
    type LightNovelRateListItem,
  } from '~/features/light-novel/rate'
  import { pickRateDimensions } from '~/features/rate/dimensions'
  import { LIGHT_NOVEL_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { useRateVote } from '~/features/light-novel/useRateVote'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'LightNovelRatesItem' })
  const props = defineProps<{ rate: LightNovelRateListItem; lightNovelId: number }>()

  const { vote, votingKind } = useRateVote(props.lightNovelId)

  const readHours = computed(() =>
    props.rate.time_to_finish_minutes > 0 ? Math.round(props.rate.time_to_finish_minutes / 60) : 0,
  )
  const highlyRated = computed(() => props.rate.like_count >= RATE_HIGHLY_RATED_LIKES)
  const dimensions = computed(() => pickRateDimensions(props.rate, LIGHT_NOVEL_RATE_DIMENSIONS))
  const volumeLabel = computed(() => {
    const v = props.rate.volume
    if (!v) return ''
    return v.volume_number != null ? `第 ${v.volume_number} 卷` : v.name_cn || v.name || '分卷'
  })
</script>

<template>
  <article
    class="mb-4 flex break-inside-avoid flex-col gap-3.5 rounded-xl border border-surface-200 bg-surface-0 p-4 dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex items-center gap-3">
      <Avatar :user="rate.rater" card shape="circle" class="size-10! shrink-0" />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <div class="flex flex-wrap items-center gap-2">
          <UserName
            :user="rate.rater"
            class="text-sm font-medium text-surface-900 dark:text-surface-0"
          />
          <NuxtLink
            v-if="rate.volume"
            :to="`/light-novel-volumes/${rate.volume.id}`"
            class="inline-flex items-center gap-1 rounded-md border border-surface-200 bg-surface-100 px-2 py-0.5 text-[11px] font-medium text-surface-600 transition-colors hover:text-hikari-primary-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300 dark:hover:text-hikari-primary-400"
          >
            <BookText class="size-[11px]" />
            {{ volumeLabel }}
          </NuxtLink>
          <span
            v-if="rate.status"
            class="inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium"
            :class="
              rate.status === 'COMPLETED'
                ? 'border-hikari-primary-500 bg-hikari-primary-50 text-hikari-primary-700 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
                : 'border-surface-200 bg-surface-100 text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300'
            "
          >
            <component :is="STATUS_ICON[rate.status]" class="size-[11px]" />
            {{ LIGHT_NOVEL_STATUS_LABEL[rate.status] }}
          </span>
          <span
            v-if="highlyRated"
            class="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            <Star class="size-[11px] fill-amber-400 text-amber-400" />
            高赞
          </span>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-surface-500 dark:text-surface-400">
          <span v-if="readHours" class="flex items-center gap-1">
            <Clock class="size-[11px]" />
            {{ readHours }} 小时
          </span>
          <span v-if="readHours" class="text-surface-300 dark:text-surface-600">·</span>
          <span>{{ timeFromNow(rate.created_at) }}</span>
        </div>
      </div>
      <span v-if="rate.rate != null" class="flex shrink-0 items-center gap-1">
        <Star class="size-3.5 fill-amber-400 text-amber-400" />
        <span class="text-base font-semibold text-surface-900 tabular-nums dark:text-surface-0">
          {{ rate.rate }}
        </span>
      </span>
    </div>

    <RateDimensionChips :dimensions="dimensions" />

    <p
      v-if="rate.rate_content"
      class="text-[13px] leading-[22px] wrap-anywhere text-surface-700 dark:text-surface-300"
    >
      <Spoiler v-if="rate.is_spoiler">{{ rate.rate_content }}</Spoiler>
      <template v-else>{{ rate.rate_content }}</template>
    </p>

    <div class="flex items-center gap-4">
      <Button
        login-required
        text
        size="small"
        :severity="rate.my_value === 1 ? undefined : 'secondary'"
        :loading="votingKind === 'like'"
        :disabled="!!votingKind"
        :label="rate.like_count.toString()"
        class="-mx-2 -my-1 gap-1.5! px-2! py-1! text-xs! font-semibold! hover:bg-transparent! active:bg-transparent!"
        :class="{ 'hover:text-surface-700! dark:hover:text-surface-200!': rate.my_value !== 1 }"
        @click="vote(rate, 'like')"
      >
        <template #icon><InteractionLikeIcon :active="rate.my_value === 1" /></template>
      </Button>
    </div>
  </article>
</template>
