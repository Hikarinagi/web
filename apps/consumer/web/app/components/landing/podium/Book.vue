<script setup lang="ts">
  import { Grid, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingPodiumBook' })
  defineProps<{
    items: { work: LandingWork; detail?: string; status?: string }[]
  }>()
</script>

<template>
  <ScrollRail class="-mx-4 -my-2 lg:-mx-2">
    <Grid
      gap="none"
      class="w-max auto-cols-(--landing-tile-lg) grid-flow-col grid-cols-none gap-4 px-4 py-2 lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-5 lg:gap-x-6 lg:gap-y-6 lg:px-2"
    >
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.work.id"
        :to="item.work.to"
        class="hn-state-layer -m-2 flex min-w-0 hn-interactive flex-col gap-3 rounded-xl p-2 hn-press-lg"
      >
        <Ripple />
        <Stack gap="none" class="relative">
          <EntryBookCover :media="item.work.cover" :alt="item.work.title" :width="480" />
          <Tag
            variant="solid"
            :tone="index < 3 ? 'accent' : 'neutral'"
            class="pointer-events-none absolute top-2 left-2 min-w-6 justify-center tabular-nums shadow-sm"
          >
            {{ index + 1 }}
          </Tag>
        </Stack>
        <Stack gap="none" class="min-w-0 gap-1">
          <Text weight="semibold" class="line-clamp-2 leading-snug">{{ item.work.title }}</Text>
          <Text v-if="item.work.sub" size="sm" tone="muted" truncate>{{ item.work.sub }}</Text>
          <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
            <Tag v-if="item.status" size="sm" tone="neutral" class="shrink-0">
              {{ item.status }}
            </Tag>
            <Text v-if="item.detail" size="sm" tone="muted" truncate class="tabular-nums">
              {{ item.detail }}
            </Text>
          </Inline>
        </Stack>
      </NuxtLink>
    </Grid>
  </ScrollRail>
</template>
