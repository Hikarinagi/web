<script setup lang="ts">
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
      <SelectButton
        v-model="tab"
        :options="tabs"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        class="ml-auto self-center"
        aria-label="人气榜范围"
      />
    </template>
    <div class="grid grid-cols-1 gap-x-10 gap-y-1 md:grid-cols-2">
      <NuxtLink
        v-for="(item, index) in items"
        :key="item.id"
        :to="`/mangas/${item.id}`"
        class="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-emphasis"
      >
        <span
          class="w-8 shrink-0 text-center text-2xl leading-none font-bold tabular-nums"
          :class="
            index < 3
              ? 'text-hikari-primary-500 dark:text-hikari-primary-400'
              : 'text-surface-300 dark:text-surface-700'
          "
        >
          {{ index + 1 }}
        </span>
        <div
          class="h-[62px] w-11 shrink-0 overflow-hidden rounded border border-surface bg-surface-100 dark:bg-surface-800"
        >
          <HikariImage
            :src="topVotedMedia(item.covers)"
            :alt="titleOf(item)"
            class="size-full"
            image-class="object-cover object-top"
            preset="small"
          />
        </div>
        <div class="min-w-0 flex-1">
          <p
            class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
          >
            {{ titleOf(item) }}
          </p>
          <p class="mt-0.5 text-xs text-muted-color">{{ subText(item) }}</p>
        </div>
      </NuxtLink>
    </div>
  </MangaHomeSection>
</template>
