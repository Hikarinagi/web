<script setup lang="ts">
  import { AspectRatio, Stack, Tag, Text } from '@hina-ui/vue'
  import { titleOf, yearOf, type SeriesCardItem } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelExploreSeriesCard' })
  const props = defineProps<{ item: SeriesCardItem; badge?: string }>()

  const title = computed(() => titleOf(props.item))
  const cover = computed(() => topVotedMedia(props.item.covers))
  const year = computed(() => yearOf(props.item))
</script>

<template>
  <NuxtLink
    :to="`/light-novels/${item.id}`"
    class="group flex shrink-0 hn-interactive flex-col gap-2 rounded-lg hn-press-none"
  >
    <AspectRatio
      :ratio="7 / 10"
      class="relative overflow-hidden rounded-lg border border-line bg-subtle"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        preset="medium"
      />
      <Tag
        v-if="badge"
        variant="solid"
        tone="neutral"
        size="sm"
        class="absolute top-1.5 left-1.5 backdrop-blur-sm"
      >
        {{ badge }}
      </Tag>
    </AspectRatio>
    <Stack gap="none" class="min-w-0 gap-0.5">
      <Text
        size="sm"
        weight="medium"
        truncate
        class="transition-colors group-hover:text-accent-text"
      >
        {{ title }}
      </Text>
      <Text v-if="year" size="xs" tone="muted">{{ year }}</Text>
    </Stack>
  </NuxtLink>
</template>
