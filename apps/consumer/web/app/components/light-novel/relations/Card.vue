<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getNovelRelationLabel } from '~/labels/work'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'LightNovelRelationsCard' })
  const props = defineProps<{ item: LightNovelPageData['relations'][number] }>()

  const target = computed(() => props.item.target_light_novel)
  const title = computed(() => target.value.name_cn || target.value.name)
  const cover = computed(() => topVotedMedia(target.value.covers))
  const year = computed(() => {
    if (!target.value.publication_date) return null
    const d = new Date(target.value.publication_date)
    return Number.isNaN(d.getTime()) ? null : d.getFullYear()
  })
</script>

<template>
  <NuxtLink :to="`/light-novels/${target.id}`" class="group flex min-w-0 flex-col gap-2">
    <div
      class="relative aspect-7/10 overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="size-full"
        image-class="object-cover object-top"
        :processing="{ quality: 82 }"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span
        class="absolute top-1.5 left-1.5 rounded bg-surface-900/75 px-1.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm"
      >
        {{ getNovelRelationLabel(item.relation) }}
      </span>
    </div>
    <div class="flex flex-col gap-0.5">
      <p
        class="truncate text-sm font-medium text-surface-900 transition-colors group-hover:text-hikari-primary-600 dark:text-surface-100 dark:group-hover:text-hikari-primary-400"
      >
        {{ title }}
      </p>
      <p v-if="year" class="text-xs text-surface-500 dark:text-surface-400">{{ year }}</p>
    </div>
  </NuxtLink>
</template>
