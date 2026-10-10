<script setup lang="ts">
  import { Inline, Stepper, Tag } from '@hina-ui/vue'
  import { PROJECT_STATUS_META } from '~/features/workbench/labels'
  import { projectStatusLabel, projectSteps } from '~/features/workbench/manga/labels'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{ project: BackendMangaProject }>()

  const tone = computed(() => PROJECT_STATUS_META[props.project.status]?.tone ?? 'neutral')
  const steps = computed(() => projectSteps(props.project))
  const items = computed(() =>
    steps.value.labels.map((title, index) => ({
      title,
      completed: steps.value.current === 2 && index === 2,
    })),
  )
</script>

<template>
  <Inline gap="md" align="center" :wrap="false" class="shrink-0">
    <Tag size="sm" :tone="tone">{{ projectStatusLabel(project) }}</Tag>
    <Stepper
      v-if="steps.current >= 0"
      :items="items"
      :model-value="steps.current + 1"
      size="sm"
      disabled
      class="w-64"
    />
  </Inline>
</template>
