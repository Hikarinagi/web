<script setup lang="ts">
  import { Center, IconButton, Stack, Tag, Text } from '@hina-ui/vue'
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

  const TYPE_META: Record<string, { label: string; icon: Component }> = {
    galgame: { label: 'Galgame', icon: GamepadDirectional },
    light_novel: { label: '轻小说', icon: BookOpen },
    manga: { label: '漫画', icon: BookImage },
    article: { label: '文章', icon: FileText },
    post: { label: '图文', icon: MessageSquare },
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
  <Stack gap="none" class="group/item relative">
    <NuxtLink :to="meta.href" class="flex flex-col gap-2">
      <Center
        class="aspect-3/4 overflow-hidden rounded-lg bg-inset ring-1 ring-line transition-colors group-hover/item:ring-line-strong"
      >
        <HikariImage
          v-if="meta.cover"
          :src="meta.cover"
          :alt="meta.title"
          class="size-full"
          image-class="size-full object-cover"
          :processing="{ width: 360, height: 480, fit: 'cover', quality: 80 }"
        />
        <component :is="typeMeta?.icon" v-else :size="28" class="text-muted opacity-50" />
      </Center>
      <Stack gap="xs">
        <Tag v-if="typeMeta" size="sm" class="self-start">{{ typeMeta.label }}</Tag>
        <Text as="span" size="sm" weight="medium" class="line-clamp-2">{{ meta.title }}</Text>
        <Text v-if="item.note" as="span" size="xs" tone="muted" class="line-clamp-1">
          {{ item.note }}
        </Text>
      </Stack>
    </NuxtLink>

    <IconButton
      v-if="isSelf"
      label="移除收藏"
      variant="soft"
      tone="neutral"
      size="sm"
      pill
      class="absolute top-2 right-2 bg-surface/90 shadow-sm ring-1 ring-line backdrop-blur transition-opacity md:opacity-0 md:group-hover/item:opacity-100 md:focus-visible:opacity-100"
      @click="emit('remove')"
    >
      <BookmarkMinus />
    </IconButton>
  </Stack>
</template>
