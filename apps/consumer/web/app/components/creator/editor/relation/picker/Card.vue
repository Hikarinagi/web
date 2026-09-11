<script setup lang="ts">
  import { Card, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import type { BackendEntitySummary } from '~/features/creator/editor'
  import type { EntityTarget } from '~/features/creator/composables/useEntitySearch'
  import { ENTITY_FALLBACK_IMAGE, ENTITY_KINDS } from '~/features/entity/entity'

  const props = defineProps<{
    item: BackendEntitySummary
    selected: boolean
    target: EntityTarget
  }>()

  const imageClass = computed(() =>
    cn('size-full', props.target === 'producer' ? 'object-contain' : 'object-cover object-top'),
  )
  const cover = computed(
    () => props.item.cover ?? (ENTITY_KINDS.includes(props.target) ? ENTITY_FALLBACK_IMAGE : ''),
  )
</script>

<template>
  <Card
    as="button"
    type="button"
    :padded="false"
    :aria-pressed="selected"
    :class="
      cn(
        'hn-state-layer relative w-full hn-interactive p-2 text-start hn-press-lg',
        selected && 'border-accent bg-accent-soft ring-2 ring-accent-soft',
      )
    "
  >
    <Ripple />
    <Stack gap="xs">
      <HikariImage
        :src="cover"
        alt=""
        preset="small"
        class="aspect-square w-full rounded bg-inset"
        :image-class="imageClass"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <Text as="span" size="sm" weight="medium" truncate>{{ item.name }}</Text>
      <Text as="span" size="xs" tone="muted" class="font-mono">#{{ item.id }}</Text>
    </Stack>

    <Tag
      v-if="selected"
      variant="solid"
      tone="accent"
      class="absolute top-0 left-0 rounded-tr-none rounded-bl-none"
    >
      已选
    </Tag>
    <Tag
      v-if="item.status === 'PENDING'"
      tone="warning"
      class="absolute top-0 right-0 rounded-tl-none rounded-br-none"
    >
      未核实
    </Tag>
  </Card>
</template>
