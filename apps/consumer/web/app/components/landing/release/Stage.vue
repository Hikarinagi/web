<script setup lang="ts">
  import { Grid, Section, Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { groupByDay, useAutoplay, useStagePick } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'
  import { topVotedMedia } from '~/utils/media/image'

  type ScheduleItem = ApiData<'/api/v3/landing/galgames', 'get'>['schedule'][number]

  defineOptions({ name: 'LandingReleaseStage' })
  const props = defineProps<{ items: ScheduleItem[]; today: string }>()

  const days = computed(() =>
    groupByDay(props.items, item => item.release_date?.slice(0, 10), props.today),
  )
  const staged = computed(() =>
    days.value.flatMap(day => day.items).filter(item => item.images.length),
  )
  const upcoming = days.value
    .flatMap(day => (day.past ? [] : day.items))
    .find(item => item.images.length)
  const { selected, pick } = useStagePick(upcoming ?? staged.value.at(-1) ?? props.items[0]!)
  const stage = useTemplateRef<{ $el: HTMLElement }>('stage')
  const { running, paused } = useAutoplay(() => stage.value?.$el)
  const shot = ref(0)
  watch(selected, () => (shot.value = 0))

  function advance() {
    if (shot.value < selected.value.images.length - 1) {
      shot.value += 1
      return
    }
    const list = staged.value
    pick(list[(list.indexOf(selected.value) + 1) % list.length] ?? selected.value)
  }

  const work = computed(() => galgameWork(selected.value))
  const hash = computed(() => {
    const image = selected.value.images[shot.value] ?? selected.value.images[0]
    return image?.thumb_hash ?? topVotedMedia(selected.value.covers)?.thumb_hash ?? null
  })
</script>

<template>
  <Section ref="stage" class="relative isolate">
    <LandingBackdrop :id="`${selected.id}-${shot}`" :hash="hash" />
    <Stack
      gap="lg"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-(--landing-stage-top) pb-12 lg:px-6"
    >
      <VisuallyHidden as="h2">发售日程</VisuallyHidden>
      <Grid gap="lg" class="lg:grid-cols-12">
        <Stack v-if="staged.length" gap="md" class="min-w-0 lg:col-span-8">
          <LandingReleaseGallery
            v-model:shot="shot"
            :item="selected"
            :title="work.title"
            :to="work.to"
            :running="running"
            :paused="paused"
            @advance="advance"
          />
          <LandingReleaseInfo :item="selected" />
        </Stack>
        <Stack
          gap="xs"
          :class="cn('min-w-0', staged.length ? 'lg:col-span-4' : 'lg:col-span-12 lg:min-h-96')"
        >
          <LandingReleaseCalendarLink :today="today" />
          <LandingReleaseStrip
            :days="days"
            :selected="selected.id"
            class="lg:hidden"
            @pick="pick"
          />
          <Stack gap="none" class="relative hidden min-h-0 flex-1 lg:block">
            <LandingReleaseList :days="days" :today="today" :selected="selected.id" @pick="pick" />
          </Stack>
        </Stack>
      </Grid>
    </Stack>
  </Section>
</template>
