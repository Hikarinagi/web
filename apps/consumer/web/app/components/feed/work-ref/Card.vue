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
      class="hn-state-layer z-1 flex hn-interactive items-stretch gap-3 rounded-xl p-3 shadow-xs hn-press-lg"
    >
      <Ripple />

      <HikariImage
        :src="workRef.cover"
        :alt="workRef.title"
        class="h-17 w-12 shrink-0 rounded"
        image-class="size-full object-cover"
        preset="small"
      />

      <Stack gap="none" justify="between" class="min-w-0 flex-1">
        <Text as="p" size="sm" weight="semibold" truncate class="font-bold">
          {{ workRef.title }}
        </Text>
        <Inline v-if="workRef.producer || workRef.year" gap="sm" align="center" :wrap="false">
          <Text v-if="workRef.producer" as="span" size="xs" tone="muted" truncate class="min-w-0">
            {{ workRef.producer }}
          </Text>
          <Text v-if="workRef.year" as="span" size="xs" tone="faint" class="shrink-0 tabular-nums">
            {{ workRef.year }} 年
          </Text>
        </Inline>
        <Inline gap="sm" align="center" :wrap="false">
          <Text as="span" size="xs" tone="muted" class="shrink-0">{{ typeLabel }}</Text>
          <Inline v-if="score != null" gap="none" align="center" :wrap="false" class="gap-1.5">
            <Rating :model-value="score" :max="10" :stars="5" readonly size="sm" />
            <Text as="span" size="sm" weight="medium">{{ score.toFixed(1) }}</Text>
          </Inline>
        </Inline>
      </Stack>
    </Card>
  </WorkCardTrigger>
</template>
