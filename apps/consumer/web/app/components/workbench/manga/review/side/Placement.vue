<script setup lang="ts">
  import { Button, DescriptionDetails, DescriptionList, DescriptionTerm, Panel } from '@hina-ui/vue'
  import { LANGUAGE_LABELS } from '~/features/galgame/labels'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { projectEpisode, seriesTitle } from '~/features/workbench/manga/series'

  const emit = defineEmits<{ correct: [] }>()

  const { project } = useMangaReview()
  const wholeVolume = computed(() => project.value.scope === 'VOLUME')
  const language = computed(
    () =>
      LANGUAGE_LABELS[project.value.source_lang as keyof typeof LANGUAGE_LABELS] ??
      project.value.source_lang,
  )
</script>

<template>
  <Panel title="归类">
    <template v-if="project.status === 'REVIEW' && project.viewer_reviewer" #actions>
      <Button size="sm" variant="ghost" @click="emit('correct')">修正</Button>
    </template>
    <DescriptionList orientation="horizontal">
      <DescriptionTerm>作品</DescriptionTerm>
      <DescriptionDetails>{{ seriesTitle(project.series) }}</DescriptionDetails>
      <DescriptionTerm>范围</DescriptionTerm>
      <DescriptionDetails>{{ wholeVolume ? '整卷' : '一话' }}</DescriptionDetails>
      <DescriptionTerm>{{ wholeVolume ? '单行本' : '话' }}</DescriptionTerm>
      <DescriptionDetails>{{ projectEpisode(project) }}</DescriptionDetails>
      <DescriptionTerm>图源语言</DescriptionTerm>
      <DescriptionDetails>{{ language }}</DescriptionDetails>
      <template v-if="project.replaces">
        <DescriptionTerm>替换</DescriptionTerm>
        <DescriptionDetails>现有版本：{{ project.replaces.page_count }} 页</DescriptionDetails>
      </template>
    </DescriptionList>
  </Panel>
</template>
