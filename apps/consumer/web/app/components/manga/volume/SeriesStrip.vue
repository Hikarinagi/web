<script setup lang="ts">
  import { AspectRatio, Flex, Link, Stack, Text } from '@hina-ui/vue'
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
  <WorkSection v-if="volumes.length > 1" title="本系列" :meta="positionText">
    <template #action>
      <NuxtLink v-slot="{ href, navigate }" :to="`/mangas/${volume.manga.id}`" custom>
        <Link :href="href ?? undefined" class="text-sm font-medium" @click="navigate">
          全部单行本
        </Link>
      </NuxtLink>
    </template>
    <ScrollRail class="-mx-6">
      <Flex align="start" gap="none" class="min-w-max gap-3 px-6 pt-1 pb-3">
        <div
          v-for="item in volumes"
          :key="item.id"
          :ref="item.id === volume.id ? el => (currentRef = el as HTMLElement) : undefined"
          class="w-20 shrink-0"
        >
          <NuxtLink
            :to="`/manga-volumes/${item.id}`"
            class="group block hn-interactive rounded-md hn-press-none"
          >
            <AspectRatio
              :ratio="2 / 3"
              class="overflow-hidden rounded-md bg-subtle ring-1"
              :class="item.id === volume.id ? 'ring-2 ring-accent' : 'ring-line'"
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
            </AspectRatio>
            <Stack gap="none" class="mt-1.5">
              <Text
                size="xs"
                truncate
                class="text-center transition-colors"
                :class="
                  item.id === volume.id
                    ? 'font-semibold text-accent-text'
                    : 'text-muted group-hover:text-accent-text'
                "
              >
                {{ getMangaVolumeLabel(item) || getMangaVolumeTitle(item) }}
              </Text>
            </Stack>
          </NuxtLink>
        </div>
      </Flex>
    </ScrollRail>
  </WorkSection>
</template>
