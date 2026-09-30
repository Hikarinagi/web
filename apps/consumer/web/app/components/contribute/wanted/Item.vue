<script setup lang="ts">
  import { AspectRatio, Card, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  withDefaults(
    defineProps<{
      title: string
      subtitle?: string | null
      cover?: string | null
      to?: string
      pinned?: boolean
    }>(),
    { subtitle: null, cover: null, to: undefined },
  )
</script>

<template>
  <Card
    :as="to ? NuxtLink : 'button'"
    :to="to"
    :type="to ? undefined : 'button'"
    :padded="false"
    :class="
      cn(
        'hn-state-layer flex min-w-0 hn-interactive flex-col overflow-hidden text-left hn-press-lg',
        pinned && 'border-accent',
      )
    "
  >
    <Ripple />
    <AspectRatio :ratio="11 / 16" class="bg-inset">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="size-full"
        image-class="object-cover"
      />
    </AspectRatio>
    <Stack as="span" gap="none" class="min-w-0 p-2">
      <Text as="span" size="sm" weight="medium" truncate>{{ title }}</Text>
      <Text v-if="subtitle" as="span" size="xs" tone="muted" truncate>{{ subtitle }}</Text>
      <slot />
    </Stack>
  </Card>
</template>
