<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeAbout' })
  defineProps<{
    volume: MangaVolumePageData['volume']
    contributors: MangaVolumePageData['contributors']
  }>()
</script>

<template>
  <WorkSection title="关于本卷">
    <Flex direction="col" gap="none" class="gap-8 lg:flex-row lg:items-start">
      <MangaVolumeAboutIntro :volume="volume" />
      <MangaVolumeAboutArchive
        :volume="volume"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-70 lg:shrink-0"
      />
    </Flex>
  </WorkSection>
</template>
