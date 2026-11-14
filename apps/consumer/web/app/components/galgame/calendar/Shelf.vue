<script setup lang="ts">
  import { Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamesCalendarPageData } from '~~/server/api/pages/galgames/calendar.get'
  import { coverRatio } from '~/features/galgame/calendar'
  import { yenLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'

  type Item = GalgamesCalendarPageData['calendar']['items'][number]

  defineOptions({ name: 'GalgameCalendarShelf' })
  const props = defineProps<{ list: Item[] }>()

  const books = computed(() =>
    props.list.map(item => ({ item, work: galgameWork(item), ratio: coverRatio(item) })),
  )
</script>

<template>
  <Inline
    gap="none"
    align="start"
    class="min-w-0 gap-x-5 gap-y-6 [--shelf-height:var(--calendar-shelf-height-sm)] after:grow-999 after:content-[''] max-sm:gap-x-3 sm:[--shelf-height:var(--calendar-shelf-height)]"
  >
    <Stack
      v-for="{ item, work, ratio } in books"
      :key="item.id"
      :as="NuxtLink"
      :to="work.to"
      gap="sm"
      class="hn-state-layer relative isolate -m-2 box-content min-w-0 hn-interactive rounded-xl p-2 hn-press-lg"
      :style="{
        flex: `${ratio} 1 calc(var(--shelf-height) * ${ratio})`,
        maxWidth: `calc(var(--shelf-height) * ${ratio} * 1.25)`,
      }"
    >
      <Ripple />
      <HikariImage
        :src="work.cover"
        :alt="`${work.title} 封面`"
        :processing="{ width: 480, quality: 84, fit: 'scale-down' }"
        class="w-full overflow-hidden rounded-md bg-subtle shadow-md ring-1 ring-fg/10"
        image-class="object-cover"
        :style="{ aspectRatio: ratio }"
      />
      <Stack gap="none" class="min-w-0 gap-0.5">
        <Text size="sm" weight="semibold" class="line-clamp-2 leading-snug">{{ work.title }}</Text>
        <Inline gap="sm" justify="between" :wrap="false" class="min-w-0">
          <Text size="xs" tone="muted" truncate class="min-w-0">{{ work.sub }}</Text>
          <Text
            v-if="item.price"
            size="xs"
            tone="muted"
            class="shrink-0 font-mono whitespace-nowrap tabular-nums"
          >
            {{ yenLabel(item.price) }}
          </Text>
        </Inline>
      </Stack>
    </Stack>
  </Inline>
</template>
