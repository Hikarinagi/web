<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameAbout' })
  defineProps<{
    galgame: GalgamePageData['galgame']
    display: GalgamePageData['display']
    facts: GalgamePageData['facts']
    tags: GalgamePageData['tags']
    contributors: GalgamePageData['contributors']
  }>()
</script>

<template>
  <WorkSection title="关于此作">
    <Flex direction="col" gap="xl" class="lg:flex-row lg:items-start">
      <GalgameAboutIntro :galgame="galgame" :intros="display.intros" :tags="tags" />
      <GalgameAboutArchive
        :galgame="galgame"
        :facts="facts"
        :display="display"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </Flex>
  </WorkSection>
</template>
