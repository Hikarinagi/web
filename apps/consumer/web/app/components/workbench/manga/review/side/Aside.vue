<script setup lang="ts">
  import { ScrollArea, Stack } from '@hina-ui/vue'

  defineProps<{ rerunning: boolean }>()
  const emit = defineEmits<{ rerun: []; correct: []; navigate: [] }>()
</script>

<template>
  <ScrollArea class="bg-canvas">
    <Stack as="aside" gap="lg" class="p-4" aria-label="检查、批注和归类">
      <WorkbenchMangaReviewSideChecks
        :rerunning="rerunning"
        @rerun="emit('rerun')"
        @navigate="emit('navigate')"
      />
      <WorkbenchMangaReviewSideNotes @navigate="emit('navigate')" />
      <WorkbenchMangaReviewSidePlacement @correct="emit('correct')" />
    </Stack>
  </ScrollArea>
</template>
