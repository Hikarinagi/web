<script setup lang="ts">
  import { Card, Inline, Rating, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { workPath, workTypeLabel } from '#shared/utils/work'
  import type { FeedWorkRef } from '~/features/feed/feed'

  const props = defineProps<{
    workRef: FeedWorkRef
    score?: number | null
  }>()

  const to = computed(() => workPath(props.workRef.work_type, props.workRef.id))

  const typeLabel = computed(() => workTypeLabel(props.workRef.work_type))
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(props.workRef.nsfw))

  // 「Galgame · ゆずソフト · 2016」/「轻小说 · 渡航」
  const meta = computed(() =>
    [typeLabel.value, props.workRef.producer, props.workRef.year].filter(Boolean).join(' · '),
  )
</script>

<template>
  <WorkCardTrigger
    v-if="!blocked"
    :work-type="workRef.work_type"
    :work-id="workRef.id"
    class="block"
  >
    <Card
      :as="NuxtLink"
      :to="to"
      :padded="false"
      class="hn-state-layer z-1 flex hn-interactive items-start gap-3 rounded-xl p-3 shadow-xs hn-press-lg"
    >
      <Ripple />

      <HikariImage
        :src="workRef.cover"
        :alt="workRef.title"
        class="h-17 w-12 shrink-0 rounded"
        image-class="size-full object-cover"
        :processing="{ q: 90 }"
      />

      <Stack gap="none" class="min-w-0 flex-1 gap-1">
        <Text as="p" size="sm" weight="semibold" truncate class="font-bold">
          {{ workRef.title }}
        </Text>
        <Text as="p" size="xs" tone="muted" truncate>{{ meta }}</Text>
        <Inline v-if="score != null" gap="none" align="center" wrap class="gap-x-1.5 gap-y-0.5">
          <Rating :model-value="score" :max="10" :stars="5" readonly size="sm" />
          <Text as="span" size="sm" weight="medium">{{ score.toFixed(1) }}</Text>
        </Inline>
      </Stack>
    </Card>
  </WorkCardTrigger>
</template>
