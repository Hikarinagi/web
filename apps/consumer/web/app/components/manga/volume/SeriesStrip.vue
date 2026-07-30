<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { getMangaVolumeLabel, getMangaVolumeTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeSeriesStrip' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    volumes: MangaVolumePageData['volumes']
  }>()

  const currentIndex = computed(() => props.volumes.findIndex(item => item.id === props.volume.id))
  const positionText = computed(() =>
    currentIndex.value >= 0 ? `第 ${currentIndex.value + 1} / ${props.volumes.length} 卷` : '',
  )

  const currentRef = ref<HTMLElement | null>(null)
  onMounted(() => {
    currentRef.value?.scrollIntoView({ inline: 'center', block: 'nearest' })
  })
</script>

<template>
  <MangaSection v-if="volumes.length > 1" title="本系列" :meta="positionText">
    <template #action>
      <NuxtLink
        :to="`/mangas/${volume.manga.id}`"
        class="text-sm font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400"
      >
        全部单行本
      </NuxtLink>
    </template>
    <ScrollArea axis="x" shadow="both" arrows class="-mx-6">
      <div class="flex min-w-max items-start gap-3 px-6 pt-1 pb-3">
        <div
          v-for="item in volumes"
          :key="item.id"
          :ref="item.id === volume.id ? el => (currentRef = el as HTMLElement) : undefined"
          class="w-20 shrink-0"
        >
          <NuxtLink :to="`/manga-volumes/${item.id}`" class="group block outline-none">
            <div
              class="aspect-2/3 overflow-hidden rounded-md bg-surface-100 transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-primary dark:bg-surface-900"
              :class="
                item.id === volume.id
                  ? 'ring-2 ring-primary'
                  : 'ring-1 ring-surface-200 dark:ring-surface-800'
              "
            >
              <HikariImage
                :src="item.cover"
                :alt="getMangaVolumeTitle(item)"
                class="size-full"
                image-class="object-cover"
                :processing="{ width: 160, quality: 82, fit: 'cover' }"
              >
                <template #empty><span /></template>
                <template #error><span /></template>
              </HikariImage>
            </div>
            <p
              class="mt-1.5 truncate text-center text-xs"
              :class="
                item.id === volume.id
                  ? 'font-semibold text-hikari-primary-600 dark:text-hikari-primary-400'
                  : 'text-surface-500 dark:text-surface-400'
              "
            >
              {{ getMangaVolumeLabel(item) || getMangaVolumeTitle(item) }}
            </p>
          </NuxtLink>
        </div>
      </div>
    </ScrollArea>
  </MangaSection>
</template>
