<script setup lang="ts">
  import { Button, Card, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgameStreamData } from '~~/server/api/pages/galgames/stream.get'
  import { producerText, titleOf, yearText } from '~/features/galgame/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameExploreRecommendFeature' })
  const props = defineProps<{
    item: Extract<GalgameStreamData['modules'][number], { kind: 'feature' }>['item']
    intro: string | null
  }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
  const facts = computed(() => [producerText(props.item), yearText(props.item)].join(' · '))
</script>

<template>
  <Card as="section" :padded="false" class="relative isolate rounded-2xl shadow-none">
    <HikariImage
      :src="cover"
      alt=""
      class="absolute inset-0 -z-20 size-full"
      image-class="size-full object-cover"
      :processing="{ width: 1200, height: 320, fit: 'cover', quality: 60, blur: 40 }"
      :skeleton="false"
    >
      <template #empty />
      <template #error />
    </HikariImage>
    <Stack
      gap="none"
      class="absolute inset-0 -z-10 bg-linear-to-r from-canvas/96 via-canvas/88 to-canvas/55"
    />
    <Inline gap="lg" :wrap="false" class="p-6 sm:p-8">
      <NuxtLink :to="`/galgames/${item.id}`" class="block w-28 shrink-0 sm:w-32">
        <HikariImage
          :src="cover"
          :alt="title"
          class="aspect-3/4 w-full overflow-hidden rounded-lg shadow-xl"
          image-class="size-full object-cover object-top"
          preset="medium"
        />
      </NuxtLink>
      <Stack align="start" gap="sm" class="min-w-0">
        <Heading :level="2" size="xl" class="line-clamp-2 sm:text-2xl">{{ title }}</Heading>
        <Text size="sm" tone="muted">{{ facts }}</Text>
        <Text
          v-if="intro"
          size="sm"
          tone="muted"
          class="line-clamp-3 max-w-160 leading-6 whitespace-pre-line"
        >
          {{ intro }}
        </Text>
        <Button :as="NuxtLink" :to="`/galgames/${item.id}`" size="sm" class="mt-1">作品详情</Button>
      </Stack>
    </Inline>
  </Card>
</template>
