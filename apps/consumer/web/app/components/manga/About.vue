<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaAbout' })

  defineProps<{
    manga: MangaPageData['manga']
    tags: MangaPageData['tags']
    people: MangaPageData['people']
    producers: MangaPageData['producers']
    volumes: MangaPageData['volumes']
    contributors: MangaPageData['contributors']
  }>()
</script>

<template>
  <WorkSection title="关于本作">
    <Flex direction="col" gap="xl" class="lg:flex-row lg:items-start">
      <MangaAboutIntro :manga="manga" :tags="tags" />
      <MangaAboutArchive
        :manga="manga"
        :producers="producers"
        :volumes="volumes"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </Flex>
    <MangaAboutStaff :people="people" />
  </WorkSection>
</template>
