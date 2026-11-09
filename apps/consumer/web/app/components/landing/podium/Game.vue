<script setup lang="ts">
  import { Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { galgameWork } from '~/features/landing/works'

  type HotItem = ApiData<'/api/v3/landing/galgames', 'get'>['hot'][number]

  defineOptions({ name: 'LandingPodiumGame' })
  const props = defineProps<{ items: HotItem[] }>()

  const top = computed(() =>
    props.items.slice(0, 3).map(item => ({ work: galgameWork(item), image: item.images[0] })),
  )
  const rest = computed(() => props.items.slice(3).map(item => ({ work: galgameWork(item) })))
</script>

<template>
  <Grid gap="lg" class="grid-cols-2 gap-x-4 lg:grid-cols-12 lg:gap-x-6">
    <NuxtLink
      v-for="(entry, index) in top"
      :key="entry.work.id"
      :to="entry.work.to"
      :class="
        cn(
          'group flex min-w-0 flex-col gap-3',
          index === 0 ? 'col-span-2 lg:col-span-6 lg:row-span-2' : 'lg:col-span-3',
        )
      "
    >
      <Stack
        gap="none"
        :class="
          cn(
            'relative aspect-video overflow-hidden rounded-lg border border-line bg-subtle transition-colors duration-150 ease-out group-hover:border-line-strong',
            index === 0 && 'lg:aspect-auto lg:flex-1',
          )
        "
      >
        <HikariImage
          :src="entry.image ?? entry.work.cover"
          :alt="entry.image ? `${entry.work.title} 的游戏画面` : entry.work.title"
          :processing="{ width: index === 0 ? 960 : 640, quality: 82, fit: 'cover' }"
          class="absolute inset-0 size-full"
          image-class="size-full object-cover"
        />
      </Stack>
      <Inline gap="md" align="start" :wrap="false" class="min-w-0">
        <Text class="text-3xl leading-none font-bold tabular-nums">{{ index + 1 }}</Text>
        <Stack gap="none" class="min-w-0 gap-0.5">
          <Text
            weight="semibold"
            truncate
            class="transition-colors duration-150 ease-out group-hover:text-accent-text"
          >
            {{ entry.work.title }}
          </Text>
          <Text size="sm" tone="muted" truncate>{{ entry.work.sub }}</Text>
        </Stack>
      </Inline>
    </NuxtLink>
    <Stack
      v-if="rest.length"
      gap="none"
      class="col-span-2 min-w-0 lg:col-span-3 lg:col-start-10 lg:row-span-2 lg:row-start-1"
    >
      <LandingChart :rows="rest" ratio="3/4" :start="4" />
    </Stack>
  </Grid>
</template>
