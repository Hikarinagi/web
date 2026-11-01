<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { ImagePlus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { getRevisionEditPath, type WorkResourceSlug } from '~/features/revision/resources'

  defineOptions({ name: 'WorkCoverAdd' })

  const props = defineProps<{
    resource: WorkResourceSlug
    workId: number
  }>()

  const editPath = computed(() => getRevisionEditPath(props.resource, props.workId))
</script>

<template>
  <Inline
    justify="center"
    :wrap="false"
    class="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap"
  >
    <Button :as="NuxtLink" :to="editPath" target="_blank" variant="link" tone="neutral" size="sm">
      <template #icon><ImagePlus /></template>
      添加封面
    </Button>
  </Inline>
</template>
