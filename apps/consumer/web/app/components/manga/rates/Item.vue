<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import {
    MANGA_STATUS_LABEL,
    RATE_HIGHLY_RATED_LIKES,
    type MangaRateListItem,
  } from '~/features/manga/rate'
  import { MANGA_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { useRateVote } from '~/features/manga/useRateVote'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'MangaRatesItem' })
  const props = defineProps<{ rate: MangaRateListItem; mangaId: number }>()

  const { vote, votingKind } = useRateVote(props.mangaId)

  const highlyRated = computed(() => props.rate.like_count >= RATE_HIGHLY_RATED_LIKES)
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
          <span
            v-if="highlyRated"
            class="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-300"
          >
            <Star class="size-[11px] fill-amber-400 text-amber-400" />
            高赞
          </span>
        </div>
        <div class="flex items-center gap-2 text-[11px] text-surface-500 dark:text-surface-400">
          <span v-if="rate.status" class="flex items-center gap-1">
            <component :is="STATUS_ICON[rate.status]" class="size-[11px]" />
            {{ MANGA_STATUS_LABEL[rate.status] }}
          </span>
          <span v-if="rate.status" class="text-surface-300 dark:text-surface-600">·</span>
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

    <p
      v-if="rate.rate_content"
      class="text-sm leading-[22px] wrap-anywhere text-surface-700 dark:text-surface-300"
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
      <Button
        login-required
        text
        size="small"
        :severity="rate.my_value === -1 ? undefined : 'secondary'"
        :loading="votingKind === 'dislike'"
        :disabled="!!votingKind"
        :label="rate.dislike_count.toString()"
        class="-mx-2 -my-1 gap-1.5! px-2! py-1! text-xs! font-semibold! hover:bg-transparent! active:bg-transparent!"
        :class="{ 'hover:text-surface-700! dark:hover:text-surface-200!': rate.my_value !== -1 }"
        @click="vote(rate, 'dislike')"
      >
        <template #icon><InteractionDislikeIcon :active="rate.my_value === -1" /></template>
      </Button>
    </div>
  </article>
</template>
