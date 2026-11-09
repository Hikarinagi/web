<script setup lang="ts">
  import { Button, Grid, Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel, volumeLabel, weekdayLabel } from '~/features/landing/labels'
  import { novelWork } from '~/features/landing/works'

  type StageVolume = ApiData<'/api/v3/landing/light-novels', 'get'>['volumes'][number]

  defineOptions({ name: 'LandingVolumeFeature' })
  const props = defineProps<{ volume: StageVolume }>()

  const series = computed(() => novelWork(props.volume.series))
  const label = computed(() => volumeLabel(props.volume))
  const headline = computed(() => {
    const date = props.volume.release_date
    return [date ? `${dayLabel(date)}${weekdayLabel(date)}` : '', props.volume.series.bunko?.name]
      .filter(Boolean)
      .join('　')
  })
</script>

<template>
  <Grid
    gap="none"
    class="grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-3 sm:min-h-(--landing-feature-height) sm:grid-rows-[1fr_auto] sm:gap-x-8"
  >
    <NuxtLink
      :to="`/light-novel-volumes/${volume.id}`"
      class="hn-interactive self-end rounded-md hn-press-lg sm:row-span-2"
    >
      <Grid
        gap="none"
        class="w-(--landing-feature-cover-sm) grid-cols-1 sm:w-(--landing-feature-cover)"
      >
        <Transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-300"
          leave-to-class="opacity-0"
        >
          <EntryBookCover
            :key="volume.id"
            :media="volume.cover"
            :alt="`${series.title}${label} 封面`"
            :width="480"
            preload
            class="col-start-1 row-start-1 shadow-2xl"
          />
        </Transition>
      </Grid>
    </NuxtLink>
    <Stack gap="sm" class="min-w-0 sm:self-end">
      <Text size="sm" tone="muted" truncate class="min-h-(--landing-line) tabular-nums">
        {{ headline }}
      </Text>
      <Stack gap="none" class="gap-1">
        <Heading
          :level="3"
          class="line-clamp-2 min-h-(--landing-lines-2) text-2xl leading-tight font-bold sm:block sm:min-h-0 sm:truncate lg:text-4xl"
        >
          <Link :as="NuxtLink" :to="series.to" tone="neutral">{{ series.title }}</Link>
        </Heading>
        <Text truncate class="min-h-(--landing-line) text-base text-fg/80 lg:text-lg">
          {{ label }}
        </Text>
      </Stack>
      <Text size="sm" truncate class="min-h-(--landing-line) text-fg/85">{{ series.sub }}</Text>
      <Text
        size="sm"
        class="hidden min-h-(--landing-lines-3) max-w-2xl leading-relaxed text-fg/80 sm:line-clamp-3"
      >
        {{ volume.intro }}
      </Text>
    </Stack>
    <Inline gap="sm" :wrap="false" class="col-span-2 sm:col-span-1 sm:col-start-2 sm:pb-1">
      <Button v-if="volume.readable" :as="NuxtLink" :to="`/light-novel-volumes/${volume.id}/read`">
        <template #icon><BookOpen /></template>
        阅读
      </Button>
      <LandingVolumeMark v-else :key="volume.series.id" :light-novel-id="volume.series.id" />
      <Button
        :as="NuxtLink"
        :to="`/light-novel-volumes/${volume.id}`"
        variant="soft"
        tone="neutral"
      >
        查看本卷
      </Button>
      <Button
        :as="NuxtLink"
        :to="series.to"
        variant="ghost"
        tone="neutral"
        class="hidden sm:inline-flex"
      >
        查看系列
      </Button>
    </Inline>
  </Grid>
</template>
