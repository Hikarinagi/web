<script setup lang="ts">
  import type { MangaStreamBatch } from '~~/server/api/pages/mangas.get'
  import { statusText, titleOf } from '~/features/manga/explore'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'MangaHomeFeature' })
  const props = defineProps<{
    item: Extract<MangaStreamBatch['modules'][number], { kind: 'feature' }>['item']
    intro: string | null
  }>()

  const backdropProcessing = {
    width: 1200,
    height: 260,
    fit: 'cover',
    quality: 60,
    blur: 40,
  } as const

  const factText = computed(() => {
    const year = props.item.publication_date
      ? new Date(props.item.publication_date).getUTCFullYear()
      : Number.NaN
    return [Number.isFinite(year) ? `${year} 年开始连载` : '', statusText(props.item.serial_status)]
      .filter(Boolean)
      .join(' · ')
  })
</script>

<template>
  <section class="relative isolate overflow-hidden rounded-2xl border border-surface">
    <div class="absolute inset-0 -z-20">
      <HikariImage
        :src="topVotedMedia(item.covers)"
        alt=""
        class="size-full"
        image-class="object-cover"
        :processing="backdropProcessing"
        :skeleton="false"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
    </div>
    <div
      class="absolute inset-0 -z-10 bg-linear-to-r from-surface-0/95 via-surface-0/85 to-surface-0/40 dark:from-surface-950/92 dark:via-surface-950/80 dark:to-surface-950/40"
    />
    <div class="flex items-center gap-6 p-6">
      <NuxtLink :to="`/mangas/${item.id}`" class="block w-30 shrink-0">
        <HikariImage
          :src="topVotedMedia(item.covers)"
          :alt="titleOf(item)"
          class="aspect-2/3 w-full overflow-hidden rounded-lg shadow-[0px_10px_28px_0px_rgba(13,26,31,0.22)]"
          image-class="size-full object-cover object-top"
          preset="medium"
        />
      </NuxtLink>
      <div class="flex min-w-0 flex-col items-start gap-2">
        <p
          class="text-xs font-semibold tracking-widest text-hikari-primary-600 uppercase dark:text-hikari-primary-400"
        >
          完结经典
        </p>
        <h3 class="line-clamp-1 text-xl font-bold text-surface-950 dark:text-white">
          {{ titleOf(item) }}
        </h3>
        <p class="h-5 text-sm text-muted-color">{{ factText }}</p>
        <p
          v-if="intro"
          class="line-clamp-2 max-w-120 text-sm leading-5.5 text-surface-600 dark:text-surface-300"
        >
          {{ intro }}
        </p>
        <Button
          as="router-link"
          :to="`/mangas/${item.id}`"
          label="看看这部"
          size="small"
          class="mt-1"
        />
      </div>
    </div>
  </section>
</template>
