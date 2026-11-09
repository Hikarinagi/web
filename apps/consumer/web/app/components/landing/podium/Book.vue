<script setup lang="ts">
  import { Grid, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingPodiumBook' })
  const props = defineProps<{ items: { work: LandingWork; detail?: string }[] }>()

  const top = computed(() => props.items.slice(0, 3))
  const rest = computed(() =>
    props.items.slice(3).map(item => ({ work: item.work, note: item.detail })),
  )
</script>

<template>
  <Stack gap="lg">
    <Grid gap="lg" class="sm:grid-cols-3">
      <NuxtLink
        v-for="(item, index) in top"
        :key="item.work.id"
        :to="item.work.to"
        class="group flex min-w-0 items-start gap-4"
      >
        <EntryBookCover
          :media="item.work.cover"
          :alt="item.work.title"
          :width="240"
          class="w-(--landing-podium-thumb) shrink-0"
        />
        <Stack gap="sm" class="min-w-0">
          <Text class="text-3xl leading-none font-bold tabular-nums">{{ index + 1 }}</Text>
          <Stack gap="none" class="min-w-0 gap-0.5">
            <Text
              weight="semibold"
              class="line-clamp-2 transition-colors duration-150 ease-out group-hover:text-accent-text"
            >
              {{ item.work.title }}
            </Text>
            <Text v-if="item.work.sub" size="sm" tone="muted" truncate>{{ item.work.sub }}</Text>
            <Text v-if="item.detail" size="sm" tone="muted" class="tabular-nums">
              {{ item.detail }}
            </Text>
          </Stack>
        </Stack>
      </NuxtLink>
    </Grid>
    <LandingChart v-if="rest.length" :rows="rest" ratio="2/3" :start="4" wide />
  </Stack>
</template>
