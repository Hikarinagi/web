<script setup lang="ts">
  import { AspectRatio, Card, Center, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiEditorEntryCard' })

  defineProps<{
    to: string | { path: string; query: Record<string, unknown> }
    active: boolean
    state: 'created' | 'changed' | 'deleted' | null
    title: string
    facts: string
    empty?: string
    cover: ValueDraft['media']
  }>()
  defineSlots<{ menu?: () => unknown }>()
  const STATES = { created: '新建', changed: '有修改', deleted: '将删除' }
</script>

<template>
  <Stack gap="none" class="relative">
    <Card
      :as="NuxtLink"
      :to="to"
      :padded="false"
      :aria-current="active ? 'true' : undefined"
      :class="
        cn(
          'hn-state-layer hn-interactive p-3',
          $slots.menu && 'pe-12',
          state === 'deleted' && 'bg-danger-soft',
          active && 'ring-2 ring-accent',
        )
      "
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
        <Text
          v-if="state"
          size="xs"
          :class="cn('shrink-0', state === 'deleted' ? 'text-danger-text' : 'text-accent-text')"
        >
          {{ STATES[state] }}
        </Text>
      </Inline>
    </Card>
    <Center v-if="$slots.menu" class="absolute inset-y-0 end-2">
      <slot name="menu" />
    </Center>
  </Stack>
</template>
