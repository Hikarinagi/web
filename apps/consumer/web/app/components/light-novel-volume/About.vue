<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeAbout' })
  defineProps<{
    volume: LightNovelVolumePageData['volume']
    contributors: LightNovelVolumePageData['contributors']
  }>()
</script>

<template>
  <WorkSection title="关于本卷">
    <Flex direction="col" gap="xl" class="lg:flex-row lg:items-start">
      <LightNovelVolumeAboutIntro :volume="volume" />
      <LightNovelVolumeAboutArchive
        :volume="volume"
        :contributors="contributors"
        class="lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]"
      />
    </Flex>
  </WorkSection>
</template>
