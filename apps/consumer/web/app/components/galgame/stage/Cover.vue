<script setup lang="ts">
  import { Card, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import type { CoverVoteState, GalgameCover } from '~/features/galgame/useCoverVote'
  import type { HikariImageSource } from '~/utils/media/image'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'GalgameStageCover' })
  const props = defineProps<{
    galgameId: number
    cover: GalgameCover['media'] | null
    covers: GalgameCover[]
    products: GalgamePageData['products']
    mine: CoverVoteState | null
    images: HikariImageSource[]
    nsfw: boolean
    title: string
    zoomable: boolean
  }>()
  defineEmits<{ open: [] }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <Stack v-if="cover" gap="none" class="relative hidden shrink-0 lg:flex">
    <Card
      as="button"
      type="button"
      :padded="false"
      aria-label="查看封面"
      :disabled="!zoomable"
      class="overflow-hidden rounded-lg border-0 shadow-2xl ring-1 ring-fg/15 enabled:cursor-zoom-in"
      @click="$emit('open')"
    >
      <HikariImage
        :src="cover"
        :alt="`${title} 封面`"
        :ratio="layout.ratio"
        :processing="layout.processing"
        preload
        class="w-(--stage-cover-width)"
      />
    </Card>
    <NsfwControl :images="[cover, ...images]" :nsfw="nsfw" class="absolute bottom-2 left-2" />
    <GalgameCoverVoteEntry
      :galgame-id="galgameId"
      :covers="covers"
      :products="products"
      :mine="mine"
      class="absolute right-2 bottom-2"
    />
  </Stack>
  <WorkCoverAdd v-else resource="galgame" :work-id="galgameId" class="hidden shrink-0 lg:flex" />
</template>
