<script setup lang="ts">
  import { Card, Grid, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { cn } from '~/utils/cn'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeCollectionCards' })
  defineProps<{ collections: MangaHomePageData['collections'] }>()

  const fanClasses = [
    'top-2 left-0 z-1 -rotate-6',
    'top-0 left-7 z-2 rotate-0',
    'top-2 left-14 z-3 rotate-6',
  ]
</script>

<template>
  <MangaHomeSection title="按标签筛选">
    <Grid :cols="1" class="gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card
        v-for="entry in collections"
        :key="entry.title"
        :as="NuxtLink"
        :to="entry.to"
        :padded="false"
        class="group flex items-center justify-between gap-4 rounded-xl p-5 shadow-none transition-colors hover:border-accent"
      >
        <Stack gap="none" class="min-w-0">
          <Text weight="semibold" truncate class="transition-colors group-hover:text-accent-text">
            {{ entry.title }}
          </Text>
          <Text size="sm" tone="muted" class="mt-1">{{ entry.total.toLocaleString() }} 部</Text>
        </Stack>
        <Stack gap="none" class="relative h-19 w-25 shrink-0">
          <Card
            v-for="(work, index) in entry.covers"
            :key="work.id"
            :padded="false"
            :class="
              cn('absolute aspect-2/3 w-10 origin-bottom rounded bg-subtle', fanClasses[index])
            "
          >
            <HikariImage
              :src="topVotedMedia(work.covers)"
              :alt="titleOf(work)"
              class="size-full"
              image-class="object-cover object-top"
              preset="small"
            />
          </Card>
        </Stack>
      </Card>
    </Grid>
  </MangaHomeSection>
</template>
