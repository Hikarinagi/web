<script setup lang="ts">
  import { ImagePlus } from '@lucide/vue'
  import type { ClassValue } from 'clsx'
  import { cn } from '~/utils/cn'
  import { useMediaLibrary } from './composables/useMediaLibrary'
  import type { MediaLibraryMode, MediaValue } from './types'

  defineOptions({ inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      mode?: MediaLibraryMode
      max?: number | undefined
      label?: string | null
      iconSize?: number
      disabled?: boolean
    }>(),
    { mode: 'single', iconSize: 26, max: undefined, label: null },
  )
  const emit = defineEmits<{ pick: [media: MediaValue[]] }>()
  const attrs = useAttrs()
  const { open } = useMediaLibrary()

  const defaultLabel = computed(() => (props.mode === 'single' ? '从媒体库选择' : '添加图片'))

  async function onClick() {
    if (props.disabled) return
    const result = await open({ mode: props.mode, max: props.max })
    if (result.length) emit('pick', result)
  }
</script>

<template>
  <Button
    variant="outlined"
    severity="secondary"
    icon-pos="top"
    :disabled="disabled"
    :label="label ?? defaultLabel"
    size="small"
    :class="cn('aspect-square w-full!', attrs.class as ClassValue)"
    @click="onClick"
  >
    <template #icon>
      <ImagePlus :size="iconSize" />
    </template>
  </Button>
</template>
