<script setup lang="ts">
  import { AspectRatio, Grid, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import type { MangaHomePageData } from '~~/server/api/pages/mangas.get'
  import { subText, titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeRankBoard' })
  const props = defineProps<{ board: MangaHomePageData['board'] }>()

  const tabs = [
    { label: '连载中', value: 'serializing' },
    { label: '已完结', value: 'finished' },
  ]
  const tab = ref<'serializing' | 'finished'>('serializing')
  const items = computed(() => props.board[tab.value])
</script>

<template>
  <MangaHomeSection v-if="board.serializing.length || board.finished.length" title="人气榜">
    <template #actions>
      <SegmentedControl
        :model-value="tab"
        :options="tabs"
        size="sm"
        class="ms-auto self-center"
        aria-label="人气榜范围"
        @update:model-value="value => (tab = value as 'serializing' | 'finished')"
      />
    </template>
    <Grid :cols="1" class="gap-x-10 gap-y-1 md:grid-cols-2">
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.id"
        :to="`/mangas/${item.id}`"
        class="hn-state-layer flex hn-interactive items-center gap-3 rounded-lg px-2 py-2 hn-press-none"
      >
        <Text
          as="span"
          size="2xl"
          class="w-8 shrink-0 text-center leading-none font-bold tabular-nums"
          :class="rankTone(index)"
        >
          {{ index + 1 }}
        </Text>
        <AspectRatio
          :ratio="7 / 10"
          class="w-11 shrink-0 overflow-hidden rounded border border-line bg-subtle"
        >
          <HikariImage
            :src="topVotedMedia(item.covers)"
            :alt="titleOf(item)"
            class="size-full"
            image-class="object-cover object-top"
            preset="small"
          />
        </AspectRatio>
        <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
          <Text size="sm" weight="medium" truncate>{{ titleOf(item) }}</Text>
          <Text size="xs" tone="muted">{{ subText(item) }}</Text>
        </Stack>
      </NuxtLink>
    </Grid>
  </MangaHomeSection>
</template>
