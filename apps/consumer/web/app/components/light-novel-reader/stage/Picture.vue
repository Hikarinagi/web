<script setup lang="ts">
  import { Lightbox, type LightboxItem } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderStagePicture' })

  const { events } = useReader()
  const { picture } = events
  const open = ref(false)

  watch(picture, current => {
    if (current) open.value = true
  })

  const items = computed<LightboxItem[]>(() => {
    const current = picture.value
    if (!current) return []
    const { x, y, width, height } = current.bounds
    return [
      {
        id: current.src,
        src: current.src,
        alt: current.alt,
        source: () => ({ x, y, width, height }),
      },
    ]
  })
</script>

<template>
  <Lightbox v-model:open="open" :items="items" />
</template>
