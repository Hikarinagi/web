<script setup lang="ts">
  import { Card, Grid, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { LandingWork } from '~/features/landing/works'

  defineOptions({ name: 'LandingPodiumBook' })
  const props = defineProps<{
    items: { work: LandingWork; detail?: string; status?: string }[]
  }>()

  const top = computed(() => props.items.slice(0, 3))
  const rest = computed(() => props.items.slice(3))
</script>

<template>
  <Stack gap="lg">
    <Grid gap="md" class="md:grid-cols-3">
      <Card
        v-for="(item, index) in top"
        :key="item.work.id"
        :as="NuxtLink"
        :to="item.work.to"
        :padded="false"
        class="hn-state-layer min-w-0 hn-interactive hn-press-lg"
      >
        <Ripple />
        <Inline gap="md" align="stretch" :wrap="false" class="p-3">
          <EntryBookCover
            :media="item.work.cover"
            :alt="item.work.title"
            :width="240"
            class="w-(--landing-podium-thumb) shrink-0"
          />
          <Stack gap="none" justify="between" class="min-w-0 flex-1 gap-3 py-0.5">
            <Stack gap="sm" class="min-w-0">
              <Text class="text-3xl leading-none font-bold tabular-nums">{{ index + 1 }}</Text>
              <Stack gap="none" class="min-w-0 gap-0.5">
                <Text weight="semibold" class="line-clamp-2">{{ item.work.title }}</Text>
                <Text v-if="item.work.sub" size="sm" tone="muted" truncate>
                  {{ item.work.sub }}
                </Text>
              </Stack>
            </Stack>
            <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
              <Tag v-if="item.status" size="sm" tone="neutral" class="shrink-0">
                {{ item.status }}
              </Tag>
              <Text v-if="item.detail" size="sm" tone="muted" truncate class="tabular-nums">
                {{ item.detail }}
              </Text>
            </Inline>
          </Stack>
        </Inline>
      </Card>
    </Grid>
    <ScrollRail v-if="rest.length" class="-mx-4 lg:-mx-6">
      <Grid
        gap="none"
        class="w-max auto-cols-(--landing-tile) grid-flow-col grid-cols-none gap-4 px-4 pb-2 lg:w-full lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-7 lg:px-6"
      >
        <Stack
          v-for="(item, index) in rest"
          :key="item.work.id"
          gap="none"
          class="relative min-w-0"
        >
          <BrowseWorkCard
            :to="item.work.to"
            :title="item.work.title"
            :sub="item.work.sub"
            :cover="item.work.cover"
            :overlay="item.detail"
            plain-sub
          />
          <Tag
            variant="solid"
            tone="neutral"
            size="sm"
            class="pointer-events-none absolute top-1.5 left-1.5 tabular-nums"
          >
            {{ index + 4 }}
          </Tag>
        </Stack>
      </Grid>
    </ScrollRail>
  </Stack>
</template>
