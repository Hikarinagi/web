<script setup lang="ts">
  import { AspectRatio, Card, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorEntryCard' })

  defineProps<{
    to: string | { path: string; query: Record<string, unknown> }
    active: boolean
    state: 'created' | 'changed' | null
    title: string
    facts: string
    empty?: string
    cover: ValueDraft['media']
  }>()
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="to"
    :padded="false"
    :aria-current="active ? 'true' : undefined"
    :class="cn('hn-state-layer hn-interactive p-3', active && 'ring-2 ring-accent')"
  >
    <Inline gap="md" align="center" :wrap="false">
      <AspectRatio :ratio="3 / 4" class="w-10 shrink-0 overflow-hidden rounded-sm bg-inset">
        <HikariImage
          v-if="cover"
          :src="cover"
          alt=""
          preset="small"
          class="size-full"
          image-class="size-full object-cover"
        />
      </AspectRatio>
      <Stack gap="none" class="min-w-0 flex-1">
        <Text size="sm" weight="medium" lang="ja" truncate>{{ title }}</Text>
        <Text size="xs" tone="muted" truncate>{{ facts || empty }}</Text>
      </Stack>
      <Text v-if="state" size="xs" class="shrink-0 text-accent-text">
        {{ state === 'created' ? '新建' : '有修改' }}
      </Text>
    </Inline>
  </Card>
</template>
