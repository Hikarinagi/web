<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { relationLabel } from '~/features/galgame/labels'
  import { topVotedMedia } from '~/utils/media/image'

  defineOptions({ name: 'GalgameDerivativesRelationsCard' })
  const props = defineProps<{ item: GalgamePageData['relations'][number] }>()

  const target = computed(() => props.item.target_galgame)
  const title = computed(() => target.value.trans_title || target.value.origin_title)
  const cover = computed(() => topVotedMedia(target.value.covers))
  const year = computed(() => {
    if (!target.value.start_date) return null
    // date 字段按日历日处理,取 ISO 前 4 位年份,避免负时区偏移一年
    const y = Number(target.value.start_date.slice(0, 4))
    return Number.isFinite(y) && y > 0 ? y : null
  })
</script>

<template>
  <NuxtLink :to="`/galgames/${target.id}`" class="group flex min-w-0 flex-col gap-2">
    <div
      class="relative aspect-3/4 overflow-hidden rounded-lg border border-surface-200 bg-surface-100 dark:border-surface-800 dark:bg-surface-800"
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
        {{ relationLabel(item.relation) }}
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
