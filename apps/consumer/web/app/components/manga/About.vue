<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaAbout' })

  const props = defineProps<{
    manga: MangaPageData['manga']
    tags: MangaPageData['tags']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    volumes: MangaPageData['volumes']
    contributors: MangaPageData['contributors']
  }>()

  const volumeCount = computed(() => props.volumes.length)
</script>

<template>
  <MangaSection title="关于本作">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <MangaAboutIntro :manga="manga" :tags="tags" />
      <MangaAboutArchive
        :manga="manga"
        :producers="producers"
        :volume-count="volumeCount"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </div>
    <MangaAboutStaff :people="people" />
  </MangaSection>
</template>
