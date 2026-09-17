<script setup lang="ts">
  import { IconButton, Inline, Rating, Stack, Tag, Text } from '@hina-ui/vue'
  import { SquarePen } from '@lucide/vue'
  import { workPath } from '#shared/utils/work'
  import {
    RATE_DIMENSION_LABELS,
    rateDateLine,
    rateStatusLabel,
    type SpaceRateItem,
  } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabsRatesRow' })

  const props = defineProps<{ item: SpaceRateItem; isSelf: boolean; busy?: boolean }>()
  const emit = defineEmits<{ edit: [SpaceRateItem] }>()

  const statusLabel = computed(() => rateStatusLabel(props.item.work_type, props.item.status))
  const dimensions = computed(() =>
    props.item.dimensions.map(d => ({
      label: RATE_DIMENSION_LABELS[d.key] ?? d.key,
      score: d.score,
    })),
  )
</script>

<template>
  <NuxtLink
    :to="workPath(item.work_type, item.id)"
    class="group flex gap-4 border-b border-line py-4 last:border-b-0"
  >
    <HikariImage
      :src="item.cover"
      :alt="item.title"
      class="h-21 w-15 shrink-0 rounded-md bg-inset"
      image-class="size-full object-cover"
      :processing="{ width: 120, height: 168, fit: 'cover', quality: 80 }"
    />
    <Stack gap="sm" class="min-w-0 flex-1">
      <Inline gap="sm" align="start" justify="between" :wrap="false">
        <Inline gap="sm" class="min-w-0" :wrap="false">
          <Text weight="semibold" truncate class="transition-colors group-hover:text-accent-text">
            {{ item.title }}
          </Text>
          <Tag v-if="statusLabel" size="sm" class="shrink-0">{{ statusLabel }}</Tag>
        </Inline>
        <Inline gap="xs" :wrap="false" class="shrink-0">
          <template v-if="item.rate">
            <Rating :model-value="item.rate" :max="10" :stars="5" readonly size="sm" />
            <Text as="span" weight="semibold">{{ item.rate }}</Text>
          </template>
          <IconButton
            v-if="isSelf"
            label="编辑标记"
            size="sm"
            pill
            :loading="busy"
            @click.stop.prevent="emit('edit', item)"
          >
            <SquarePen />
          </IconButton>
        </Inline>
      </Inline>

      <RateDimensionChips v-if="dimensions.length" :dimensions="dimensions" />
      <Text v-else-if="item.rate_content" size="sm" tone="muted" class="line-clamp-2">
        “{{ item.rate_content }}”
      </Text>

      <Text size="xs" tone="muted">{{ rateDateLine(item) }}</Text>
    </Stack>
  </NuxtLink>
</template>
