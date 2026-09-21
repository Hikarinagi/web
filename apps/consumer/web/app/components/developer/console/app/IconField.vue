<script setup lang="ts">
  import { Button, Inline, Stack, Text } from '@hina-ui/vue'
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
  <Inline gap="md" align="center" wrap>
    <DeveloperConsoleAppIcon :src="props.src" :name="props.name" size="lg" />
    <Stack gap="sm" class="min-w-0">
      <Stack gap="xs">
        <Text as="span" size="sm" weight="medium">应用图标</Text>
        <Text as="span" size="xs" tone="muted">展示在用户的授权页与账号中心，选图后裁剪为圆形</Text>
      </Stack>
      <Inline gap="sm" align="center">
        <Button variant="outline" tone="neutral" size="sm" :loading="choosing" @click="pick">
          <template #icon><ImagePlus /></template>
          {{ props.src ? '更换图标' : '选择图标' }}
        </Button>
        <Button
          v-if="props.src"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="emit('picked', null)"
        >
          <template #icon><X /></template>
          移除
        </Button>
      </Inline>
    </Stack>

    <MediaLibraryCropDialog
      v-model:visible="cropVisible"
      :media="source"
      title="裁剪应用图标"
      :aspect-ratio="1"
      :output-width="256"
      :output-height="256"
      @cropped="media => emit('picked', media)"
    />
  </Inline>
</template>
