<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameAbout' })
  defineProps<{
    galgame: GalgamePageData['galgame']
    tags: GalgamePageData['tags']
    characters: GalgamePageData['characters']
    producers: GalgamePageData['producers']
    contributors: GalgamePageData['contributors']
  }>()
</script>

<template>
  <GalgameSection title="关于此作">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <GalgameAboutIntro :galgame="galgame" :tags="tags" />
      <GalgameAboutArchive
        :galgame="galgame"
        :producers="producers"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </div>
    <GalgameAboutSteam
      v-if="galgame.steam_apps.length"
      :galgame-id="galgame.id"
      :app-ids="galgame.steam_apps.map(app => app.app_id)"
    />
    <GalgameAboutCharacters :characters="characters" />
  </GalgameSection>
</template>
