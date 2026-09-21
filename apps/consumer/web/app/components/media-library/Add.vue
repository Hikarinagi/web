<script setup lang="ts">
  import { Button } from '@hina-ui/vue'
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
      disabled?: boolean
    }>(),
    { mode: 'single', max: undefined, label: null },
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
    variant="outline"
    tone="neutral"
    size="sm"
    :disabled="disabled"
    :class="cn('aspect-square h-auto w-full flex-col', attrs.class as ClassValue)"
    @click="onClick"
  >
    <template #icon><ImagePlus /></template>
    {{ label ?? defaultLabel }}
  </Button>
</template>
