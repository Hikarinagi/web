<script setup lang="ts">
  import { AspectRatio, Button, Card, Empty, Grid, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { chapterLabel, timeLabel } from '~/features/landing/labels'
  import { mangaWork } from '~/features/landing/works'

  type UpdateDay = ApiData<'/api/v3/landing/mangas', 'get'>['days'][number]

  defineOptions({ name: 'LandingUpdateDay' })
  const props = defineProps<{ day: UpdateDay; size: number }>()

  const entries = computed(() =>
    props.day.items.map(item => ({
      item,
      work: mangaWork(item),
      chapter: chapterLabel(item.chapter),
      time: item.chapter ? `${timeLabel(item.chapter.at)} 更新` : '',
    })),
  )
  const lead = computed(() => entries.value[0])
  const rest = computed(() => entries.value.slice(1))
  const blanks = computed(() => Math.max(0, props.size - 1 - rest.value.length))
</script>

<template>
  <Empty v-if="!lead" title="这一天没有更新" class="min-h-(--landing-feature-height)" />
  <Grid v-else gap="lg" class="lg:grid-cols-12 lg:gap-x-6">
    <Stack gap="none" class="min-w-0 lg:relative lg:col-span-3">
      <Stack gap="md" class="min-w-0 flex-row lg:absolute lg:inset-0 lg:flex-col">
        <Card
          :as="NuxtLink"
          :to="lead.work.to"
          :padded="false"
          class="w-(--landing-feature-cover-sm) shrink-0 hn-interactive overflow-hidden bg-subtle shadow-none hn-press-lg sm:w-(--landing-feature-cover) lg:w-full"
        >
          <HikariImage
            :src="lead.work.cover"
            :alt="lead.work.title"
            :ratio="7 / 10"
            preload
            :processing="{ width: 480, quality: 84, fit: 'cover' }"
            class="w-full"
            image-class="object-cover object-top"
          />
        </Card>
        <Stack gap="sm" class="min-w-0 lg:min-h-0 lg:flex-1">
          <Stack gap="none" class="min-w-0 gap-0.5">
            <Link
              :as="NuxtLink"
              :to="lead.work.to"
              tone="neutral"
              class="truncate text-lg font-semibold"
            >
              {{ lead.work.title }}
            </Link>
            <Inline gap="sm" align="baseline" :wrap="false" class="min-w-0">
              <Text v-if="lead.chapter" size="sm" truncate class="text-accent-text tabular-nums">
                {{ lead.chapter }}
              </Text>
              <Text size="sm" tone="muted" class="shrink-0 tabular-nums">{{ lead.time }}</Text>
            </Inline>
          </Stack>
          <Text
            size="sm"
            class="line-clamp-3 min-h-(--landing-lines-3) leading-relaxed text-fg/80 lg:line-clamp-none lg:min-h-0 lg:flex-1 lg:overflow-hidden lg:mask-(--landing-text-fade)"
          >
            {{ lead.item.intro }}
          </Text>
          <Button
            v-if="lead.item.chapter"
            :as="NuxtLink"
            :to="`/mangas/${lead.item.id}/read/${lead.item.chapter.id}`"
            class="self-start"
          >
            <template #icon><BookOpen /></template>
            阅读{{ lead.chapter }}
          </Button>
        </Stack>
      </Stack>
    </Stack>
    <ScrollRail class="-mx-4 -my-2 sm:-mx-2 lg:col-span-9">
      <Grid
        gap="none"
        class="w-max auto-cols-(--landing-tile) grid-flow-col gap-x-4 px-4 py-2 sm:w-auto sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-4 sm:gap-y-6 sm:px-2 lg:grid-cols-5"
      >
        <BrowseWorkCard
          v-for="entry in rest"
          :key="entry.item.id"
          :to="entry.work.to"
          :title="entry.work.title"
          :cover="entry.work.cover"
          ratio="2/3"
        >
          <template #meta>
            <Text v-if="entry.chapter" size="xs" truncate class="text-accent-text tabular-nums">
              {{ entry.chapter }}
            </Text>
            <Text size="xs" tone="muted" truncate class="tabular-nums">{{ entry.time }}</Text>
          </template>
        </BrowseWorkCard>
        <Stack
          v-for="blank in blanks"
          :key="`blank-${blank}`"
          gap="none"
          aria-hidden="true"
          class="invisible hidden gap-2 sm:flex"
        >
          <AspectRatio :ratio="2 / 3" />
          <Stack gap="none" class="gap-1">
            <Text size="sm">&nbsp;</Text>
            <Text size="xs">&nbsp;</Text>
            <Text size="xs">&nbsp;</Text>
          </Stack>
        </Stack>
      </Grid>
    </ScrollRail>
  </Grid>
</template>
