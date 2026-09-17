<script setup lang="ts">
  import { AspectRatio, Inline, Text } from '@hina-ui/vue'
  import { titleOf, type LightNovelSummary } from '~/features/light-novel/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelExploreRanking' })
  defineProps<{ items: LightNovelSummary[] }>()
</script>

<template>
  <LightNovelExploreSection v-if="items.length" title="排行榜" meta="人气最高 · 按浏览量排序">
    <LightNovelExploreRailViewport content-class="flex min-w-max items-stretch gap-5 px-6 pb-2">
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.id"
        :to="`/light-novels/${item.id}`"
        class="group flex w-52 shrink-0 hn-interactive flex-col gap-2 rounded-lg hn-press-none"
      >
        <Inline align="end" gap="none" :wrap="false" class="gap-1.5">
          <Text as="span" class="text-6xl leading-none font-bold" :class="rankTone(index)">
            {{ index + 1 }}
          </Text>
          <AspectRatio
            :ratio="7 / 10"
            class="w-33 overflow-hidden rounded-lg border border-line bg-subtle"
          >
            <HikariImage
              :src="topVotedMedia(item.covers)"
              :alt="titleOf(item)"
              class="size-full"
              image-class="object-cover object-top"
              preset="medium"
            />
          </AspectRatio>
        </Inline>
        <Text
          size="sm"
          weight="medium"
          truncate
          class="transition-colors group-hover:text-accent-text"
        >
          {{ titleOf(item) }}
        </Text>
      </NuxtLink>
    </LightNovelExploreRailViewport>
  </LightNovelExploreSection>
</template>
