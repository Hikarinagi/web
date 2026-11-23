<script setup lang="ts">
  import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@hina-ui/vue'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import {
    placementBasis,
    placementHeading,
    placementMethod,
    placementOutcome,
  } from '~/features/workbench/manga/placement'

  defineProps<{
    project: Pick<BackendMangaProject, 'status' | 'hint' | 'placement' | 'placement_complete'>
  }>()
</script>

<template>
  <DescriptionList orientation="horizontal">
    <DescriptionTerm>系统判定</DescriptionTerm>
    <DescriptionDetails v-if="project.placement">
      {{ placementHeading(project.placement) }}（{{ placementMethod(project.placement) }}）
    </DescriptionDetails>
    <DescriptionDetails v-else-if="project.status === 'REVIEW' && !project.placement_complete">
      正在判断
    </DescriptionDetails>
    <DescriptionDetails v-else>无</DescriptionDetails>
    <template v-if="project.placement">
      <DescriptionTerm>依据</DescriptionTerm>
      <DescriptionDetails>{{ placementBasis(project.placement) || '无' }}</DescriptionDetails>
      <DescriptionTerm>结果</DescriptionTerm>
      <DescriptionDetails>{{ placementOutcome(project.placement) }}</DescriptionDetails>
    </template>
    <DescriptionTerm>投稿者填写</DescriptionTerm>
    <DescriptionDetails>{{ project.hint || '未填写' }}</DescriptionDetails>
  </DescriptionList>
</template>
