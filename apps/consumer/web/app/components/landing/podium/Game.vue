<script setup lang="ts">
  import { AspectRatio, Grid, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { galgameWork } from '~/features/landing/works'

  type HotItem = ApiData<'/api/v3/landing/galgames', 'get'>['hot'][number]

  defineOptions({ name: 'LandingPodiumGame' })
  const props = defineProps<{ items: HotItem[] }>()

  const entries = computed(() =>
    props.items.map(item => ({ work: galgameWork(item), image: item.images[0] })),
  )
</script>

<template>
  <ScrollRail class="-mx-4 -my-2 lg:-mx-2">
    <Grid
      gap="none"
      class="w-max auto-cols-(--landing-tile-wide) grid-flow-col grid-cols-none gap-4 px-4 py-2 lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-5 lg:gap-x-6 lg:gap-y-6 lg:px-2"
    >
      <NuxtLink
        v-for="(entry, index) in entries"
        :key="entry.work.id"
        :to="entry.work.to"
        class="hn-state-layer -m-2 flex min-w-0 hn-interactive flex-col gap-3 rounded-xl p-2 hn-press-lg"
      >
        <Ripple />
        <AspectRatio
          :ratio="16 / 9"
          class="relative overflow-hidden rounded-lg border border-line bg-subtle"
        >
          <HikariImage
            :src="entry.image ?? entry.work.cover"
            :alt="entry.image ? `${entry.work.title} 的游戏画面` : entry.work.title"
            :processing="{ width: 640, quality: 82, fit: 'cover' }"
            class="absolute inset-0 size-full"
            image-class="size-full object-cover"
          />
          <Tag
            variant="solid"
            :tone="index < 3 ? 'accent' : 'neutral'"
            class="pointer-events-none absolute top-2 left-2 min-w-6 justify-center tabular-nums shadow-sm"
          >
            {{ index + 1 }}
          </Tag>
        </AspectRatio>
        <Stack gap="none" class="min-w-0 gap-0.5">
          <Text weight="semibold" truncate>{{ entry.work.title }}</Text>
          <Text v-if="entry.work.sub" size="sm" tone="muted" truncate>{{ entry.work.sub }}</Text>
        </Stack>
      </NuxtLink>
    </Grid>
  </ScrollRail>
</template>
