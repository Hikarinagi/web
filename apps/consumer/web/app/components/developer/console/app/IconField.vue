<script setup lang="ts">
  import { ImagePlus, X } from '@lucide/vue'
  import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'DeveloperConsoleAppIconField' })

  const props = defineProps<{ src: string | null; name: string }>()
  const emit = defineEmits<{ picked: [media: MediaValue | null] }>()

  const { open } = useMediaLibrary()
  const choosing = ref(false)
  const cropVisible = ref(false)
  const source = ref<MediaValue | null>(null)

  async function pick() {
    if (choosing.value) return
    choosing.value = true
    try {
      const [media] = await open({ mode: 'single' })
      if (!media) return
      source.value = media
      cropVisible.value = true
    } finally {
      choosing.value = false
    }
  }
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DeveloperConsoleAppIcon :src="props.src" :name="props.name" size="lg" />
    <div class="min-w-0">
      <p class="text-sm font-medium text-color">应用图标</p>
      <p class="mt-1 text-xs text-muted-color">展示在用户的授权页与账号中心，选图后裁剪为圆形</p>
      <div class="mt-2.5 flex items-center gap-2">
        <Button
          :label="props.src ? '更换图标' : '选择图标'"
          size="small"
          severity="secondary"
          variant="outlined"
          :loading="choosing"
          @click="pick"
        >
          <template #icon><ImagePlus class="size-4" /></template>
        </Button>
        <Button
          v-if="props.src"
          label="移除"
          size="small"
          severity="secondary"
          variant="text"
          @click="emit('picked', null)"
        >
          <template #icon><X class="size-4" /></template>
        </Button>
      </div>
    </div>

    <MediaLibraryCropDialog
      v-model:visible="cropVisible"
      :media="source"
      title="裁剪应用图标"
      :aspect-ratio="1"
      :output-width="256"
      :output-height="256"
      @cropped="media => emit('picked', media)"
    />
  </div>
</template>
