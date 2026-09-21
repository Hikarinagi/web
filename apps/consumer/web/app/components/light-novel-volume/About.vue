<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'

  defineOptions({ name: 'LightNovelVolumeAbout' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    contributors: LightNovelVolumePageData['contributors']
  }>()

  const hasSummary = computed(() => Boolean(props.volume.summary_cn || props.volume.summary))
</script>

<template>
  <WorkSection title="关于本卷">
    <Flex direction="col" gap="xl" class="lg:flex-row lg:items-start">
      <LightNovelVolumeAboutIntro v-if="hasSummary" :volume="volume" />
      <LightNovelVolumeAboutArchive
        :volume="volume"
        :contributors="contributors"
        :class="
          hasSummary ? 'lg:sticky lg:top-[calc(var(--app-header-height)+1.5rem)]' : 'lg:max-w-md'
        "
      />
    </Flex>
  </WorkSection>
</template>
