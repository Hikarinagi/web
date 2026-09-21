<script setup lang="ts">
  import { Inline, Link, Rating, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { workPath, workTypeLabel } from '#shared/utils/work'
  import type { WorkCardData } from './composables/useWorkCard'

  const props = defineProps<{ work: WorkCardData | null; loading: boolean }>()

  const to = computed(() => (props.work ? workPath(props.work.work_type, props.work.id) : '#'))
  const meta = computed(() =>
    props.work
      ? [workTypeLabel(props.work.work_type), props.work.byline, props.work.year]
          .filter(Boolean)
          .join(' · ')
      : '',
  )
</script>

<template>
  <Stack gap="none">
    <WorkCardSkeleton v-if="!work" />
    <Link
      v-else
      :as="NuxtLink"
      :to="to"
      tone="neutral"
      :underline="false"
      class="flex flex-col p-3 transition-colors hover:bg-subtle"
    >
      <Inline gap="none" align="stretch" :wrap="false" class="gap-3">
        <HikariImage
          :src="work.cover"
          :alt="work.title"
          class="h-28 w-20 shrink-0 rounded-lg"
          image-class="size-full object-cover"
          :processing="{ q: 90 }"
        />
        <Stack gap="none" class="min-w-0 flex-1 gap-1">
          <Text as="p" size="sm" weight="semibold" class="line-clamp-2 font-bold">
            {{ work.title }}
          </Text>
          <Text v-if="work.original_title" as="p" size="xs" tone="muted" class="line-clamp-1">
            {{ work.original_title }}
          </Text>
          <Text v-if="meta" as="p" size="xs" tone="muted" class="line-clamp-1">{{ meta }}</Text>

          <Inline
            v-if="work.average_rate != null"
            gap="none"
            align="center"
            wrap
            class="mt-auto gap-x-1.5 gap-y-0.5 pt-1"
          >
            <Rating :model-value="work.average_rate" :max="10" :stars="5" readonly size="sm" />
            <Text as="span" size="sm" weight="semibold">{{ work.average_rate.toFixed(1) }}</Text>
            <Text as="span" size="xs" tone="muted">· {{ work.rated_count }} 人评分</Text>
          </Inline>
          <Text v-else as="p" size="xs" tone="muted" class="mt-auto pt-1">暂无评分</Text>
        </Stack>
      </Inline>

      <Stack
        v-if="work.intro || work.aliases.length"
        gap="none"
        class="mt-2.5 border-t border-line pt-2.5"
      >
        <Text v-if="work.intro" as="p" size="xs" tone="muted" class="line-clamp-3 leading-relaxed">
          {{ work.intro }}
        </Text>
        <Text v-if="work.aliases.length" as="p" size="xs" tone="faint" class="mt-1.5 line-clamp-1">
          别名：{{ work.aliases.join(' / ') }}
        </Text>
      </Stack>
    </Link>
  </Stack>
</template>
