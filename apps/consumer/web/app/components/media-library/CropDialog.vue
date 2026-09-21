<script setup lang="ts">
  import { Button, Center, Dialog, IconButton, Skeleton, Stack } from '@hina-ui/vue'
  import { RotateCcw } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import { push } from 'notivue'
  import {
    CircleStencil,
    Cropper,
    RectangleStencil,
    type CropperResult,
  } from 'vue-advanced-cropper'
  import 'vue-advanced-cropper/dist/style.css'
  import { TRANSITION } from '~/lib/motion'
  import { resolveImageUrl } from '~/utils/media/image'
  import { uploadProfileImage } from './lib/upload'
  import type { MediaValue } from './types'

  defineOptions({ name: 'MediaLibraryCropDialog' })

  interface CropperInstance {
    getResult: () => CropperResult
    refresh: () => void
    reset: () => void
  }

  const props = defineProps<{
    media: MediaValue | null
    title: string
    aspectRatio: number
    outputWidth: number
    outputHeight: number
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ cropped: [media: MediaValue] }>()

  const config = useRuntimeConfig()
  const cropper = useTemplateRef<CropperInstance>('cropper')
  const saving = ref(false)
  const ready = ref(false)
  const failed = ref(false)

  const src = computed(() =>
    resolveImageUrl(props.media?.src, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    }),
  )
  const isCircle = computed(() => props.aspectRatio === 1)
  const stencilComponent = computed(() => (isCircle.value ? CircleStencil : RectangleStencil))
  const stencilProps = computed(() => ({
    aspectRatio: props.aspectRatio,
    previewClass: 'profile-cropper-stencil',
  }))
  const canvasOptions = computed(() => ({
    width: props.outputWidth,
    height: props.outputHeight,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: 'high',
    fillColor: 'transparent',
  }))
  const stageMotion = {
    initial: { opacity: 0, scale: 0.985 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.985 },
  }
  watch([visible, src, () => props.aspectRatio], () => {
    ready.value = false
    failed.value = false
    if (visible.value) nextTick(() => cropper.value?.refresh())
  })

  async function save() {
    if (saving.value || !ready.value || failed.value) return

    saving.value = true
    try {
      const canvas = cropper.value?.getResult().canvas
      if (!canvas) {
        push.error({ message: '无法生成裁剪结果' })
        return
      }

      const blob = await toBlob(canvas)
      if (!blob) {
        push.error({ message: '无法生成裁剪结果' })
        return
      }

      const file = new File([blob], `cropped-${Date.now()}.webp`, { type: blob.type })
      const result = await uploadProfileImage(file)
      if (!result) return

      emit('cropped', result)
      visible.value = false
    } catch {
      push.error({ message: '当前图片无法在浏览器中裁剪' })
    } finally {
      saving.value = false
    }
  }

  function reset() {
    cropper.value?.reset()
  }

  function onReady() {
    ready.value = true
    failed.value = false
  }

  function onError() {
    ready.value = false
    failed.value = true
  }

  function toBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.92))
  }
</script>

<template>
  <Dialog v-model:open="visible" :title="title" size="xl" :locked="saving">
    <template #content>
      <Stack gap="none" class="h-[min(62vh,30rem)] overflow-hidden rounded-lg bg-neutral-950">
        <ClientOnly>
          <AnimatePresence mode="wait">
            <motion.div
              v-if="src"
              :key="src"
              v-bind="stageMotion"
              :transition="TRANSITION"
              class="size-full"
            >
              <Cropper
                ref="cropper"
                class="profile-cropper size-full"
                :src="src"
                :stencil-component="stencilComponent"
                :stencil-props="stencilProps"
                :canvas="canvasOptions"
                :resize-image="false"
                :move-image="false"
                image-restriction="stencil"
                cross-origin="anonymous"
                :auto-zoom="false"
                :transitions="true"
                :debounce="80"
                @ready="onReady"
                @error="onError"
              />
            </motion.div>
            <motion.div
              v-else
              key="empty"
              v-bind="stageMotion"
              :transition="TRANSITION"
              class="size-full"
            >
              <Center class="size-full"><Skeleton class="size-40" /></Center>
            </motion.div>
          </AnimatePresence>

          <template #fallback>
            <Center class="size-full"><Skeleton class="size-40" /></Center>
          </template>
        </ClientOnly>
      </Stack>
    </template>

    <template #footer>
      <IconButton
        label="重置"
        variant="outline"
        tone="neutral"
        :disabled="!ready || saving"
        @click="reset"
      >
        <RotateCcw />
      </IconButton>
      <Button variant="ghost" tone="neutral" :disabled="saving" @click="visible = false">
        取消
      </Button>
      <Button :loading="saving" :disabled="!ready || failed" @click="save">确认</Button>
    </template>
  </Dialog>
</template>
