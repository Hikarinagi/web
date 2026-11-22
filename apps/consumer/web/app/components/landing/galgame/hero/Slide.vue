<script setup lang="ts">
  import { Ripple, Stack, Tag } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { galgameWork } from '~/features/landing/works'
  import { cn } from '~/utils/cn'

  type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]

  defineOptions({ name: 'LandingGalgameHeroSlide' })
  const props = defineProps<{ item: Slide; today: string; active: boolean }>()

  const label = computed(() =>
    props.item.work ? galgameWork(props.item.work).title : (props.item.title ?? undefined),
  )
  const to = computed(() =>
    props.item.work ? galgameWork(props.item.work).to : (props.item.link ?? undefined),
  )
  const bannerProcessing = { width: 1600, quality: 86, fit: 'scale-down' } as const
</script>

<template>
  <Stack
    as="article"
    gap="none"
    :aria-label="label"
    class="relative isolate aspect-4/5 hn-interactive overflow-hidden rounded-2xl bg-canvas text-fg hn-press-lg sm:aspect-video lg:aspect-auto lg:h-(--landing-banner-height) [&:has([data-actions]_:active)]:[--hn-press-scale:1]"
  >
    <component
      :is="to ? NuxtLink : Stack"
      :to="to"
      :target="!item.work && item.open_in_new ? '_blank' : undefined"
      :rel="!item.work && item.open_in_new ? 'noopener' : undefined"
      tabindex="-1"
      aria-hidden="true"
      :class="cn('absolute inset-0 isolate overflow-hidden', to && 'hn-state-layer')"
    >
      <Ripple v-if="to" />
      <HikariImage
        :src="item.banner"
        alt=""
        :lazy="false"
        :processing="bannerProcessing"
        class="absolute inset-0"
        image-class="size-full object-cover"
      />
      <Stack
        gap="none"
        class="absolute inset-0 bg-linear-to-t from-canvas via-canvas/80 via-50% to-transparent to-85% sm:bg-linear-to-r sm:from-canvas/90 sm:via-canvas/40 sm:via-35% sm:to-transparent sm:to-60%"
      />
      <Stack
        gap="none"
        class="absolute inset-x-0 bottom-0 hidden h-2/5 bg-linear-to-t from-canvas/70 to-transparent sm:flex"
      />
    </component>
    <Tag v-if="item.is_ad" variant="solid" class="pointer-events-none absolute top-4 right-4">
      广告
    </Tag>
    <Stack gap="lg" class="pointer-events-none relative mt-auto max-w-2xl p-5 sm:p-8 lg:p-12">
      <LandingGalgameHeroSlideWork
        v-if="item.work"
        :item="item.work"
        :description="item.description"
        :today="today"
      />
      <LandingGalgameHeroSlideCustom v-else :item="item" />
    </Stack>
    <Stack
      gap="none"
      aria-hidden="true"
      :class="
        cn(
          'pointer-events-none absolute inset-0 bg-canvas transition-opacity duration-500',
          active ? 'opacity-0' : 'opacity-50',
        )
      "
    />
  </Stack>
</template>
