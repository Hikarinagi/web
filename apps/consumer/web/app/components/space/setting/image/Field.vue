<script setup lang="ts">
  import { Button, Center, Inline, Stack, Text } from '@hina-ui/vue'
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
  <Inline gap="lg" align="center">
    <Center
      :class="
        cn(
          'shrink-0 overflow-hidden bg-inset text-muted',
          isCircle ? 'size-18 rounded-full' : 'aspect-6/1 w-75 max-w-full rounded-lg',
        )
      "
    >
      <HikariImage
        v-if="model"
        :src="model.src"
        alt=""
        class="size-full"
        image-class="size-full object-cover"
        :processing="{ q: 85 }"
      />
      <component :is="isCircle ? User : ImagePlus" v-else :size="isCircle ? 30 : 22" />
    </Center>

    <Stack gap="xs" align="start" class="min-w-0">
      <Text size="sm" weight="medium">{{ label }}</Text>
      <Text size="xs" tone="muted">{{ hint }}</Text>
      <Button size="sm" variant="outline" tone="neutral" :loading="choosing" @click="pick">
        <template #icon><component :is="isCircle ? Camera : ImagePlus" /></template>
        {{ buttonLabel }}
      </Button>
    </Stack>

    <MediaLibraryCropDialog
      v-model:visible="cropVisible"
      :media="picked"
      :title="cropTitle"
      :aspect-ratio="aspectRatio"
      :output-width="outputSize.width"
      :output-height="outputSize.height"
      @cropped="apply"
    />
  </Inline>
</template>
