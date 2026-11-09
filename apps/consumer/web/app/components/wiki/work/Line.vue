<script setup lang="ts">
  import { AspectRatio, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { WikiSearchItem } from '~/features/wiki/entries'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkLine' })

  defineProps<{
    work: { id: number; label: string }
    card?: Pick<WikiSearchItem, 'cover' | 'year' | 'makers'> | null
    link?: boolean
    strike?: boolean
  }>()
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="min-w-0">
    <AspectRatio :ratio="3 / 4" class="w-10 shrink-0 overflow-hidden rounded-sm bg-inset">
      <HikariImage
        v-if="card?.cover"
        :src="card.cover"
        alt=""
        preset="small"
        class="size-full"
        image-class="size-full object-cover"
      />
    </AspectRatio>
    <Stack gap="none" class="min-w-0">
      <Link
        v-if="link"
        :as="NuxtLink"
        :to="`/entries/${work.id}/edit`"
        lang="ja"
        :class="cn('truncate text-sm', strike && 'line-through')"
      >
        {{ work.label || '未命名' }}
      </Link>
      <Text v-else size="sm" lang="ja" truncate :class="cn(strike && 'line-through')">
        {{ work.label || '未命名' }}
      </Text>
      <Inline v-if="card?.year || card?.makers.length" gap="sm" :wrap="false" class="min-w-0">
        <Text v-if="card.year" size="xs" tone="muted" class="shrink-0 tabular-nums">
          {{ card.year }} 年
        </Text>
        <Text size="xs" tone="muted" lang="ja" truncate>{{ card.makers.join('、') }}</Text>
      </Inline>
    </Stack>
  </Inline>
</template>
