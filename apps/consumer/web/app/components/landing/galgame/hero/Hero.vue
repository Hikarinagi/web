<script setup lang="ts">
  import { Section, Stack, VisuallyHidden } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { useAutoplay } from '~/features/landing/stage'
  import { topVotedMedia } from '~/utils/media/image'

  type Pick = ApiData<'/api/v3/landing/galgames', 'get'>['picks'][number]

  defineOptions({ name: 'LandingGalgameHero' })
  const props = defineProps<{ picks: Pick[]; today: string }>()

  const upcoming = props.picks.findIndex(
    item => (item.release_date?.slice(0, 10) ?? '') >= props.today,
  )
  const index = ref(upcoming === -1 ? props.picks.length - 1 : upcoming)
  const current = computed(() => props.picks[index.value] ?? props.picks[0]!)
  const hero = useTemplateRef<{ $el: HTMLElement }>('hero')
  const { running, paused } = useAutoplay(() => hero.value?.$el)

  function advance() {
    index.value = (index.value + 1) % props.picks.length
  }
</script>

<template>
  <Section ref="hero" class="relative isolate">
    <LandingBackdrop :id="current.id" :hash="topVotedMedia(current.covers)?.thumb_hash" />
    <Stack
      gap="xl"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-(--landing-stage-top) pb-10 lg:px-6"
    >
      <VisuallyHidden as="h2">新作精选</VisuallyHidden>
      <LandingGalgameHeroInfo :item="current" :today="today" />
      <LandingGalgameHeroShelf
        :items="picks"
        :index="index"
        :today="today"
        :cycling="running && picks.length > 1"
        :paused="paused"
        @select="index = $event"
        @advance="advance"
      />
    </Stack>
  </Section>
</template>
