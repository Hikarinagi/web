<script setup lang="ts">
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'

  defineOptions({ name: 'MangaVolumeAbout' })
  defineProps<{
    volume: MangaVolumePageData['volume']
    contributors: MangaVolumePageData['contributors']
  }>()
</script>

<template>
  <MangaSection title="关于本卷">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <MangaVolumeAboutIntro :volume="volume" />
      <MangaVolumeAboutArchive
        :volume="volume"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)] lg:w-70 lg:shrink-0"
      />
    </div>
  </MangaSection>
</template>
