<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { useScroll } from '@vueuse/core'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { dayLabel } from '~/features/landing/labels'
  import { useAlignTo, useReveal } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'
  import { cn } from '~/utils/cn'
  import { topVotedMedia } from '~/utils/media/image'

  type Pick = ApiData<'/api/v3/landing/galgames', 'get'>['picks'][number]

  defineOptions({ name: 'LandingGalgameHeroShelf' })
  const props = defineProps<{
    items: Pick[]
    index: number
    today: string
    cycling: boolean
    paused: boolean
  }>()
  const emit = defineEmits<{ select: [index: number]; advance: [] }>()

  const shelf = computed(() =>
    props.items.map(item => {
      const cover = topVotedMedia(item.covers)
      const ratio = cover?.width && cover.height ? cover.width / cover.height : 0.75
      return {
        item,
        work: galgameWork(item),
        date: item.release_date?.slice(0, 10) ?? null,
        ratio: Math.min(Math.max(ratio, 0.66), 1),
      }
    }),
  )
  const row = useTemplateRef<{ $el: HTMLElement }>('row')
  const viewport = computed(() => row.value?.$el ?? null)
  const { arrivedState } = useScroll(viewport)
  const { width } = useElementSize(viewport)
  const more = computed(
    () =>
      width.value > 0 &&
      !arrivedState.right &&
      (viewport.value?.scrollWidth ?? 0) > (viewport.value?.clientWidth ?? 0),
  )
  useAlignTo(
    () => row.value?.$el,
    () =>
      row.value?.$el.querySelector<HTMLElement>(
        `[data-stage-item="${props.items[props.index]?.id}"]`,
      ),
    'x',
  )
  useReveal(
    () => row.value?.$el,
    () => props.items[props.index]?.id ?? 0,
    'x',
  )
  const coverProcessing = { width: 560, quality: 85, fit: 'scale-down' } as const
</script>

<template>
  <Inline
    ref="row"
    gap="lg"
    align="end"
    :wrap="false"
    :class="
      cn(
        '-mx-4 [scrollbar-width:none] overflow-x-auto px-4 pt-6 pb-2 lg:mx-0 lg:px-0',
        more && 'mask-(--landing-shelf-fade)',
      )
    "
  >
    <Stack
      v-for="({ item, work, date, ratio }, position) in shelf"
      :key="item.id"
      gap="sm"
      :data-stage-item="item.id"
      class="shrink-0"
    >
      <NuxtLink
        :to="work.to"
        :aria-label="work.title"
        :class="
          cn(
            'block origin-bottom rounded-lg transition duration-300 ease-out',
            position === index
              ? '-translate-y-3 scale-105 shadow-2xl'
              : 'shadow-md hover:-translate-y-1 dark:brightness-75 dark:hover:brightness-100',
          )
        "
        @mouseenter="emit('select', position)"
        @focus="emit('select', position)"
      >
        <HikariImage
          :src="work.cover"
          :alt="work.title"
          :ratio="ratio"
          :lazy="false"
          :processing="coverProcessing"
          class="h-(--landing-shelf-height) overflow-hidden rounded-lg ring-1 ring-fg/10"
          image-class="size-full object-cover"
        />
      </NuxtLink>
      <Stack gap="xs">
        <Text
          size="xs"
          :tone="position === index ? 'default' : 'muted'"
          weight="medium"
          class="tabular-nums"
        >
          {{ date === today ? '今天' : date ? dayLabel(date) : '' }}
        </Text>
        <Stack gap="none" class="h-0.5 overflow-hidden rounded-full bg-fg/10">
          <Stack
            v-if="position === index && cycling"
            :key="item.id"
            gap="none"
            :class="
              cn(
                'h-full origin-left animate-landing-progress bg-accent',
                paused && '[animation-play-state:paused]',
              )
            "
            @animationend="emit('advance')"
          />
        </Stack>
      </Stack>
    </Stack>
  </Inline>
</template>
