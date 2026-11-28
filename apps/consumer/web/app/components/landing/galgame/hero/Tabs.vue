<script setup lang="ts">
  import { Card, Inline, Ripple, Stack } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { useCentered } from '~/features/landing/stage'
  import { galgameWork } from '~/features/landing/works'
  import { cn } from '~/utils/cn'

  type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]

  defineOptions({ name: 'LandingGalgameHeroTabs' })
  const props = defineProps<{
    items: Slide[]
    selected: number
    cycling: boolean
    paused: boolean
  }>()
  const emit = defineEmits<{ select: [index: number]; advance: [] }>()

  const tabs = computed(() =>
    props.items.map(item => ({
      item,
      title: item.work ? galgameWork(item.work).title : (item.title ?? ''),
      shot: item.banner ?? item.wall[0] ?? null,
    })),
  )
  const shotProcessing = { width: 240, quality: 82, fit: 'cover' } as const
  const track = useTemplateRef<{ viewport?: HTMLElement | null }>('track')

  useCentered(
    () => track.value?.viewport,
    () => props.selected,
  )
</script>

<template>
  <ScrollRail ref="track" class="-mx-2">
    <Inline gap="sm" justify="center" :wrap="false" class="mx-auto w-max px-1 py-2 sm:gap-3">
      <Card
        v-for="({ item, title, shot }, index) in tabs"
        :key="item.id"
        v-tooltip="title"
        :data-stage-item="index"
        as="button"
        type="button"
        :padded="false"
        :aria-label="title"
        :aria-current="index === selected || undefined"
        class="hn-state-layer relative isolate aspect-video w-20 shrink-0 hn-interactive border-0 bg-transparent p-1 shadow-none hn-press-lg sm:w-28"
        @click="emit('select', index)"
      >
        <Ripple />
        <Stack
          gap="none"
          :class="
            cn(
              'relative size-full transition-transform duration-300',
              index === selected && 'scale-105',
            )
          "
        >
          <HikariImage
            :src="shot"
            alt=""
            :lazy="false"
            :processing="shotProcessing"
            :class="
              cn(
                'size-full overflow-hidden rounded-md transition-opacity duration-300',
                index !== selected && 'opacity-45 hover:opacity-80',
              )
            "
            image-class="size-full object-cover"
          />
        </Stack>
        <Transition
          enter-active-class="transition-opacity duration-300"
          enter-from-class="opacity-0"
          leave-active-class="transition-opacity duration-300"
          leave-to-class="opacity-0"
        >
          <Stack v-if="index === selected" gap="none" class="pointer-events-none absolute inset-0">
            <LandingPickRing
              :running="cycling"
              :paused="paused"
              :cycle="item.id"
              :seconds="item.duration_seconds"
              @done="emit('advance')"
            />
          </Stack>
        </Transition>
      </Card>
    </Inline>
  </ScrollRail>
</template>
