<script setup lang="ts">
  import { Card, Inline, Ripple } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
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
      shot: item.banner,
    })),
  )
  const shotProcessing = { width: 240, quality: 82, fit: 'cover' } as const
</script>

<template>
  <ScrollRail>
    <Inline gap="sm" justify="center" :wrap="false" class="mx-auto w-max p-1 sm:gap-3">
      <Card
        v-for="({ item, title, shot }, index) in tabs"
        :key="item.id"
        v-tooltip="title"
        as="button"
        type="button"
        :padded="false"
        :aria-label="title"
        :aria-current="index === selected || undefined"
        class="hn-state-layer relative isolate aspect-video w-20 shrink-0 hn-interactive border-0 bg-transparent p-1 shadow-none hn-press-lg sm:w-28"
        @click="emit('select', index)"
      >
        <Ripple />
        <HikariImage
          :src="shot"
          alt=""
          :lazy="false"
          :processing="shotProcessing"
          :class="
            cn(
              'size-full overflow-hidden rounded-md transition-opacity',
              index !== selected && 'opacity-45 hover:opacity-80',
            )
          "
          image-class="size-full object-cover"
        />
        <LandingPickRing
          v-if="index === selected"
          :running="cycling"
          :paused="paused"
          :cycle="item.id"
          @done="emit('advance')"
        />
      </Card>
    </Inline>
  </ScrollRail>
</template>
