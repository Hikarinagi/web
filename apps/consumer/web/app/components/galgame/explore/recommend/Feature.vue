<script setup lang="ts">
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
  <section class="relative isolate overflow-hidden rounded-2xl border border-surface">
    <HikariImage
      :src="cover"
      alt=""
      class="absolute inset-0 -z-20 size-full"
      image-class="size-full object-cover"
      :processing="{ width: 1200, height: 320, fit: 'cover', quality: 60, blur: 40 }"
      :skeleton="false"
    >
      <template #empty><span /></template>
      <template #error><span /></template>
    </HikariImage>
    <div
      class="absolute inset-0 -z-10 bg-linear-to-r from-surface-0/96 via-surface-0/88 to-surface-0/55 dark:from-surface-950/95 dark:via-surface-950/86 dark:to-surface-950/55"
    />
    <div class="flex items-center gap-6 p-6 sm:p-8">
      <NuxtLink :to="`/galgames/${item.id}`" class="block w-28 shrink-0 sm:w-32">
        <HikariImage
          :src="cover"
          :alt="title"
          class="aspect-3/4 w-full overflow-hidden rounded-lg shadow-[0_12px_32px_rgba(13,26,31,0.24)]"
          image-class="size-full object-cover object-top"
          preset="medium"
        />
      </NuxtLink>
      <div class="flex min-w-0 flex-col items-start gap-2">
        <h2 class="line-clamp-2 text-xl font-bold text-color sm:text-2xl">{{ title }}</h2>
        <p class="text-sm text-muted-color">{{ facts }}</p>
        <p
          v-if="intro"
          class="line-clamp-3 max-w-160 text-sm leading-6 whitespace-pre-line text-surface-600 dark:text-surface-300"
        >
          {{ intro }}
        </p>
        <Button
          as="router-link"
          :to="`/galgames/${item.id}`"
          label="作品详情"
          size="small"
          class="mt-1"
        />
      </div>
    </div>
  </section>
</template>
