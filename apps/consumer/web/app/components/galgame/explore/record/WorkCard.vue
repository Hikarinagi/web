<script setup lang="ts">
  import { Card, Center, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { CalendarDays, Check } from '@lucide/vue'
  import type { GalgameSummary } from '~/features/galgame/explore'
  import { producerText, titleOf, yearText } from '~/features/galgame/explore'
  import { cn } from '~/utils/cn'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecordWorkCard' })

  const props = defineProps<{
    item: GalgameSummary
    selected?: boolean
  }>()
  const emit = defineEmits<{ select: [item: GalgameSummary] }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
</script>

<template>
  <Card
    as="button"
    type="button"
    :padded="false"
    :aria-label="`选择 ${title}`"
    :aria-pressed="selected"
    :class="
      cn(
        'hn-state-layer w-full hn-interactive p-2.5 text-start hn-press-lg',
        selected && 'border-accent bg-accent-soft',
      )
    "
    @click="emit('select', item)"
  >
    <Ripple />
    <Inline gap="sm" align="center" class="min-w-0">
      <HikariImage
        :src="cover"
        :alt="title"
        class="h-18 w-13.5 shrink-0 overflow-hidden rounded-md border border-line bg-inset"
        image-class="size-full object-cover object-top"
        :processing="{ width: 160, height: 216, fit: 'cover', quality: 80 }"
        :lazy="true"
        :skeleton="false"
      />

      <Stack gap="xs" class="min-w-0 flex-1">
        <Text as="span" weight="semibold" truncate>{{ title }}</Text>
        <Text as="span" size="xs" weight="medium" tone="muted" truncate>
          {{ producerText(item) }}
        </Text>
        <Inline as="span" gap="xs" align="center">
          <CalendarDays class="size-3 text-faint" aria-hidden="true" />
          <Text as="span" size="xs" tone="faint">{{ yearText(item) }}</Text>
        </Inline>
      </Stack>

      <Center
        aria-hidden="true"
        :class="
          cn(
            'size-7 shrink-0 rounded-full border',
            selected ? 'border-accent bg-accent text-accent-on' : 'border-line text-faint',
          )
        "
      >
        <Check class="size-4" />
      </Center>
    </Inline>
  </Card>
</template>
