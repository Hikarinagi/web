<script setup lang="ts">
  import {
    BookImage,
    BookOpen,
    BookmarkMinus,
    FileText,
    GamepadDirectional,
    MessageSquare,
  } from '@lucide/vue'
  import type { Component } from 'vue'
  import type { SpaceCollectionItem } from '~/features/space/space'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'SpaceFavoriteItemCard' })

  const props = defineProps<{ item: SpaceCollectionItem; isSelf: boolean }>()
  const emit = defineEmits<{ remove: [] }>()

  const TYPE_META: Record<string, { label: string; dot: string; icon: Component }> = {
    galgame: { label: 'Galgame', dot: 'bg-blue-500', icon: GamepadDirectional },
    light_novel: { label: '轻小说', dot: 'bg-purple-500', icon: BookOpen },
    manga: { label: '漫画', dot: 'bg-teal-500', icon: BookImage },
    article: { label: '文章', dot: 'bg-green-500', icon: FileText },
    post: { label: '图文', dot: 'bg-orange-500', icon: MessageSquare },
  }

  const meta = computed(() => {
    const it = props.item
    if (it.type === 'galgame' && it.galgame) {
      return {
        title: it.galgame.trans_title || it.galgame.origin_title,
        href: `/galgames/${it.galgame.id}`,
        cover: topVotedMedia(it.galgame.covers),
      }
    }
    if (it.type === 'light_novel' && it.light_novel) {
      return {
        title: it.light_novel.name_cn || it.light_novel.name,
        href: `/light-novels/${it.light_novel.id}`,
        cover: topVotedMedia(it.light_novel.covers),
      }
    }
    if (it.type === 'manga' && it.manga) {
      return {
        title: it.manga.name_cn || it.manga.name,
        href: `/mangas/${it.manga.id}`,
        cover: topVotedMedia(it.manga.covers),
      }
    }
    if (it.type === 'article' && it.article)
      return {
        title: it.article.title,
        href: `/articles/${it.article.id}`,
        cover: it.article.cover?.src ?? null,
      }
    if (it.type === 'post' && it.post)
      return {
        title: it.post.title || '无标题图文',
        href: `/posts/${it.post.id}`,
        cover: it.post.covers?.[0]?.media?.src ?? null,
      }
    return { title: '', href: '#', cover: null }
  })
  const typeMeta = computed(() => TYPE_META[props.item.type])
</script>

<template>
  <div class="group/item relative">
    <NuxtLink :to="meta.href" class="flex flex-col gap-2">
      <div
        class="aspect-3/4 overflow-hidden rounded-lg bg-surface-100 ring-1 ring-surface-200 transition-colors group-hover/item:ring-surface-300 dark:bg-surface-800 dark:ring-surface-700 dark:group-hover/item:ring-surface-600"
      >
        <HikariImage
          v-if="meta.cover"
          :src="meta.cover"
          :alt="meta.title"
          class="size-full"
          image-class="size-full object-cover"
          :processing="{ width: 360, height: 480, fit: 'cover', quality: 80 }"
        />
        <div v-else class="flex size-full items-center justify-center">
          <component :is="typeMeta?.icon" :size="28" class="text-muted-color opacity-50" />
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <span class="inline-flex w-fit items-center gap-1.5 text-[11px] text-muted-color">
          <span class="size-1.5 rounded-full" :class="typeMeta?.dot" />
          {{ typeMeta?.label }}
        </span>
        <span class="line-clamp-2 text-[13px] font-medium text-color">{{ meta.title }}</span>
        <span v-if="item.note" class="line-clamp-1 text-xs text-muted-color">{{ item.note }}</span>
      </div>
    </NuxtLink>

    <button
      v-if="isSelf"
      v-tooltip.top="'移除收藏'"
      type="button"
      aria-label="移除收藏"
      class="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-surface-0/90 text-color opacity-100 shadow-sm ring-1 ring-surface-200 backdrop-blur transition-opacity hover:bg-emphasis md:opacity-0 md:group-hover/item:opacity-100 md:focus-visible:opacity-100 dark:bg-surface-900/90 dark:ring-surface-700"
      @click="emit('remove')"
    >
      <BookmarkMinus :size="15" />
    </button>
  </div>
</template>
