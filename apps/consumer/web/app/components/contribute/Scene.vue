<script setup lang="ts">
  import { Heading, Page, PageBody, Stack } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import { useMoments } from '~/features/contribute/useMoments'
  import Counter from './Counter.vue'

  defineProps<{ data: ContributePageData }>()

  const selected = ref(false)
  const active = ref(false)
  const root = useTemplateRef<{ $el: HTMLElement }>('root')
  const counter = useTemplateRef<InstanceType<typeof Counter>>('counter')
  const { isOverDropZone: dragging } = useDropZone(
    computed(() => root.value?.$el),
    { multiple: true, onDrop: files => counter.value?.receive(files ?? []) },
  )
  const interacting = computed(() => active.value || dragging.value)
  const { current, fade, markReady } = useMoments(selected, interacting)
</script>

<template>
  <Stack ref="root" gap="none" class="-mt-(--app-header-height)">
    <Stack
      as="section"
      gap="none"
      class="relative isolate z-10 h-(--contribute-scene-height) bg-contribute-shadow"
      aria-label="作品投稿"
    >
      <Heading :level="1" class="sr-only">作品投稿</Heading>
      <ContributeSceneBackdrop :moment="current" :fade="fade" @ready="markReady" />
    </Stack>
    <Page size="xl">
      <PageBody>
        <Counter
          ref="counter"
          :data="data"
          :dragging="dragging"
          @selected="selected = $event"
          @active="active = $event"
        />
      </PageBody>
    </Page>
  </Stack>
</template>
