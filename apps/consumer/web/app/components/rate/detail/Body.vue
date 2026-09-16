<script setup lang="ts">
  import { Inline, Link, Spoiler, Stack, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import type { Component } from 'vue'
  import type { RateDimensionChip } from '~/features/rate/dimensions'
  import type { BackendRate } from '~/features/rate/permalink'

  defineOptions({ name: 'RateDetailBody' })

  const props = defineProps<{
    rate: BackendRate
    following: boolean
    dimensions: RateDimensionChip[]
    statusLabel: string | null
    statusIcon: Component | null
  }>()

  const longReview = computed(() => ('long_review' in props.rate ? props.rate.long_review : null))
  const volume = computed(() => ('volume' in props.rate ? props.rate.volume : null))
  const volumeName = computed(() => {
    const v = volume.value
    if (!v) return null
    return v.name_cn || v.name || `第 ${v.volume_number ?? '?'} 卷`
  })
  const hours = computed(() =>
    'time_to_finish_minutes' in props.rate && props.rate.time_to_finish_minutes > 0
      ? Math.round(props.rate.time_to_finish_minutes / 60)
      : 0,
  )
</script>

<template>
  <Stack gap="md">
    <RateDetailHeader
      :rater="rate.rater"
      :created-at="rate.created_at"
      :following="following"
      :status-label="statusLabel"
      :status-icon="statusIcon"
      :hours="hours"
    />

    <Text v-if="rate.rate_content" class="text-[15px] leading-relaxed wrap-anywhere">
      <Spoiler v-if="rate.is_spoiler">{{ rate.rate_content }}</Spoiler>
      <template v-else>{{ rate.rate_content }}</template>
    </Text>

    <RateDimensionChips :dimensions="dimensions" />

    <FeedWorkRefCard :work-ref="rate.work_ref" :score="rate.rate" />

    <NuxtLink
      v-if="volume"
      v-slot="{ href, navigate }"
      :to="`/light-novel-volumes/${volume.id}`"
      custom
    >
      <Link :href="href ?? undefined" tone="neutral" class="w-fit text-sm" @click="navigate">
        {{ volumeName }}
      </Link>
    </NuxtLink>

    <NuxtLink
      v-if="longReview"
      v-slot="{ href, navigate }"
      :to="`/articles/${longReview.id}`"
      custom
    >
      <Link :href="href ?? undefined" class="w-fit text-sm" @click="navigate">
        <Inline gap="xs">
          {{ longReview.title }}
          <ArrowRight class="size-3.5" />
        </Inline>
      </Link>
    </NuxtLink>
  </Stack>
</template>
