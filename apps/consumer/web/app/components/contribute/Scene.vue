<script setup lang="ts">
  import { Button, Dialog, Heading, Stack, Text, TRANSITION } from '@hina-ui/vue'
  import { Motion } from 'motion-v'
  import { useMoments } from '~/features/contribute/useMoments'
  import UploadDesk from './upload/Desk.vue'

  const HELP_IDENTIFY =
    '系统读取文件中的书名、作者与 ISBN，识别对应的卷。本站暂缺的卷列为待提交；未能识别的文件需手动选择对应的卷；本站已收录的卷与多卷合集不予提交。'
  const HELP_REVIEW = '提交后文件经自动校验，通过后上架。校验结果可在「我的投稿」中查看。'

  const help = ref(false)
  const history = ref(false)
  const { requireLogin } = useAuthGate()
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
          @selected="selected = $event"
          @help="help = true"
          @history="history = requireLogin()"
        />
      </Motion>
    </ClientOnly>

    <Dialog v-model:open="help" title="投稿说明" size="sm">
      <template #content>
        <Stack gap="md">
          <Text size="sm">小说投稿支持单卷 EPUB，可一次添加多个文件。</Text>
          <Text size="sm" tone="muted">{{ HELP_IDENTIFY }}</Text>
          <Text size="sm" tone="muted">{{ HELP_REVIEW }}</Text>
        </Stack>
      </template>
      <template #footer><Button @click="help = false">知道了</Button></template>
    </Dialog>

    <ContributeHistoryDrawer v-model:open="history" />
  </Stack>
</template>

<style scoped>
  .contribute-scene {
    position: relative;
    isolation: isolate;
    min-height: var(--contribute-stage-min);
    height: 100svh;
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
