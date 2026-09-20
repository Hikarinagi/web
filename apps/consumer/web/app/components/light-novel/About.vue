<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'

  defineOptions({ name: 'LightNovelAbout' })
  defineProps<{
    lightNovel: LightNovelPageData['light_novel']
    tags: LightNovelPageData['tags']
    characters: LightNovelPageData['characters']
    people: LightNovelPageData['people']
    producers: LightNovelPageData['producers']
    contributors: LightNovelPageData['contributors']
  }>()
</script>

<template>
  <LightNovelSection title="关于本作">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <LightNovelAboutIntro :light-novel="lightNovel" :tags="tags" />
      <LightNovelAboutArchive
        :light-novel="lightNovel"
        :producers="producers"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </div>
    <LightNovelAboutStaff :people="people" />
    <LightNovelAboutCharacters :characters="characters" />
  </LightNovelSection>
</template>
