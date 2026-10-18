<script setup lang="ts">
  import { Card, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import {
    levelText,
    reasonText,
    type BackendDuplicateCandidate,
  } from '~/features/creator/duplicates'

  const props = defineProps<{ candidate: BackendDuplicateCandidate }>()

  const meta = computed(() => {
    const item = props.candidate
    return [
      item.author,
      item.label,
      item.year,
      item.volumes ? `${item.volumes} 卷` : null,
      item.bangumi_id ? `Bangumi ${item.bangumi_id}` : null,
    ]
      .filter(Boolean)
      .join(' · ')
  })
  const reasons = computed(() =>
    props.candidate.reasons.map(reason => reasonText(reason, props.candidate.resource_type)),
  )
  const levelTone = computed(() =>
    props.candidate.level === 'on_site' || props.candidate.level === 'likely'
      ? 'warning'
      : 'neutral',
  )
</script>

<template>
  <Card :padded="false">
    <Inline gap="md" align="start" :wrap="false" class="p-3">
      <HikariImage
        :src="candidate.cover ?? ''"
        alt=""
        preset="small"
        class="h-20 w-15 shrink-0 rounded bg-subtle"
        image-class="size-full object-cover"
      >
        <template #empty />
        <template #error />
      </HikariImage>

      <Stack gap="xs" class="min-w-0 flex-1">
        <Inline gap="sm" align="center">
          <Text weight="medium" truncate class="min-w-0">{{ candidate.title }}</Text>
          <Text size="xs" tone="muted" class="font-mono">#{{ candidate.id }}</Text>
          <Tag size="sm" :tone="levelTone">
            {{ levelText(candidate.level, candidate.resource_type) }}
          </Tag>
        </Inline>
        <Text v-if="candidate.subtitle" size="sm" tone="muted" truncate>
          {{ candidate.subtitle }}
        </Text>
        <Text v-if="meta" size="xs" tone="muted" truncate>{{ meta }}</Text>
        <Inline gap="xs">
          <Tag v-for="text in reasons" :key="text" size="sm" tone="info">{{ text }}</Tag>
        </Inline>
        <slot name="note" />
      </Stack>

      <Inline v-if="$slots.default" gap="xs" :wrap="false" class="shrink-0">
        <slot />
      </Inline>
    </Inline>
  </Card>
</template>
