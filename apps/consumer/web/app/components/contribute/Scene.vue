<script setup lang="ts">
  import { Heading, Stack, TRANSITION } from '@hina-ui/vue'
  import { Motion } from 'motion-v'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import { useMoments } from '~/features/contribute/useMoments'
  import UploadDesk from './upload/Desk.vue'

  defineProps<{ manga: MangaTarget | null }>()

  const selected = ref(false)
  const scene = useTemplateRef<{ $el: HTMLElement }>('scene')
  const sceneElement = computed(() => scene.value?.$el)
  const desk = useTemplateRef<InstanceType<typeof UploadDesk>>('desk')
  const deskElement = computed(() => desk.value?.$el as HTMLElement | undefined)
  const hovered = useElementHover(deskElement)
  const { focused } = useFocusWithin(deskElement)
  const { isOverDropZone: dragging } = useDropZone(sceneElement, {
    multiple: true,
    onDrop: files => desk.value?.receive(files ?? []),
  })
  const interacting = computed(() => hovered.value || focused.value || dragging.value)
  const { current, fade, markReady } = useMoments(selected, interacting)
  const enter = computed(() => (fade.value ? TRANSITION.enter : { duration: 0 }))
</script>

<template>
  <Stack ref="scene" as="section" gap="none" class="contribute-scene" aria-label="作品投稿">
    <Heading :level="1" class="sr-only">作品投稿</Heading>
    <ContributeSceneBackdrop :moment="current" :fade="fade" :lit="dragging" @ready="markReady" />

    <ClientOnly>
      <Motion as-child :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="enter">
        <UploadDesk
          ref="desk"
          class="contribute-desk"
          :dragging="dragging"
          :manga="manga"
          @selected="selected = $event"
        />
      </Motion>
    </ClientOnly>
  </Stack>
</template>

<style scoped>
  .contribute-scene {
    position: relative;
    isolation: isolate;
    min-height: var(--contribute-stage-min);
    height: var(--contribute-stage-height);
    overflow: hidden;
    background: var(--color-contribute-shadow);
  }
  .contribute-desk {
    position: absolute;
    left: var(--contribute-desk-x);
    bottom: var(--contribute-desk-y);
    width: min(var(--contribute-desk-width), calc(100% - calc(var(--spacing) * 12)));
    z-index: 3;
  }
  @media (max-width: 48rem) {
    .contribute-desk {
      left: calc(var(--spacing) * 6);
      bottom: calc(var(--spacing) * 8);
    }
  }
</style>
