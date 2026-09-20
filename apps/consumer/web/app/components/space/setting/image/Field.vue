<script setup lang="ts">
  import { Camera, ImagePlus, User } from '@lucide/vue'
  import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'SpaceSettingImageField' })

  const props = defineProps<{
    label: string
    hint: string
    shape: 'circle' | 'banner'
    buttonLabel: string
  }>()
  const model = defineModel<MediaValue | null>({ required: true })

  const { open } = useMediaLibrary()
  const choosing = ref(false)
  const cropVisible = ref(false)
  const picked = ref<MediaValue | null>(null)

  const isCircle = computed(() => props.shape === 'circle')
  const cropTitle = computed(() => (isCircle.value ? '裁剪头像' : '裁剪个人主页封面'))
  const aspectRatio = computed(() => (isCircle.value ? 1 : 6))
  const outputSize = computed(() =>
    isCircle.value ? { width: 512, height: 512 } : { width: 1920, height: 320 },
  )

  async function pick() {
    if (choosing.value) return
    choosing.value = true
    try {
      const [media] = await open({ mode: 'single' })
      if (!media) return
      picked.value = media
      cropVisible.value = true
    } finally {
      choosing.value = false
    }
  }

  function apply(media: MediaValue) {
    model.value = media
  }
</script>

<template>
  <div class="flex flex-wrap items-center gap-5">
    <div
      class="shrink-0 overflow-hidden bg-surface-100 dark:bg-surface-800"
      :class="isCircle ? 'size-[72px] rounded-full' : 'aspect-6/1 w-[300px] max-w-full rounded-lg'"
    >
      <HikariImage
        v-if="model"
        :src="model.src"
        alt=""
        class="size-full"
        image-class="size-full object-cover"
        :processing="{ q: 85 }"
      />
      <div v-else class="flex size-full items-center justify-center text-muted-color">
        <component :is="isCircle ? User : ImagePlus" :size="isCircle ? 30 : 22" />
      </div>
    </div>
    <div class="min-w-0">
      <p class="text-sm font-medium text-color">{{ label }}</p>
      <p class="mt-1 text-xs text-muted-color">{{ hint }}</p>
      <Button
        class="mt-2.5"
        :label="buttonLabel"
        size="small"
        severity="secondary"
        variant="outlined"
        :loading="choosing"
        @click="pick"
      >
        <template #icon><component :is="isCircle ? Camera : ImagePlus" class="size-4" /></template>
      </Button>
    </div>

    <MediaLibraryCropDialog
      v-model:visible="cropVisible"
      :media="picked"
      :title="cropTitle"
      :aspect-ratio="aspectRatio"
      :output-width="outputSize.width"
      :output-height="outputSize.height"
      @cropped="apply"
    />
  </div>
</template>
