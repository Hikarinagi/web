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
  const cover = computed(() => topVotedMedia(current.value.covers))
  const hero = useTemplateRef<{ $el: HTMLElement }>('hero')
  const { running, paused } = useAutoplay(() => hero.value?.$el)
  const glowProcessing = { width: 160, quality: 70, fit: 'scale-down' } as const

  function advance() {
    index.value = (index.value + 1) % props.picks.length
  }
</script>

<template>
  <Section ref="hero" class="relative isolate overflow-hidden">
    <Stack
      gap="none"
      aria-hidden="true"
      class="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <Transition
        enter-active-class="transition-opacity duration-700"
        enter-from-class="opacity-0"
        leave-active-class="absolute inset-0 transition-opacity duration-700"
        leave-to-class="opacity-0"
      >
        <HikariImage
          :key="current.id"
          :src="cover"
          alt=""
          :lazy="false"
          :skeleton="false"
          :thumbhash="false"
          :processing="glowProcessing"
          class="absolute -inset-24 scale-110 opacity-60 blur-3xl saturate-150 dark:opacity-50"
          image-class="size-full object-cover"
        />
      </Transition>
      <Stack
        gap="none"
        class="absolute inset-0 bg-linear-to-b from-canvas/20 via-canvas/50 to-canvas"
      />
    </Stack>
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
