<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { justifiedRows } from '~/features/galgame/justifiedRows'

  const props = defineProps<{
    galgame: GalgamePageData['galgame']
  }>()

  const images = computed(() => props.galgame.images.filter(image => image.src.trim()))
  const title = computed(
    () => props.galgame.trans_title || props.galgame.origin_title || `Galgame #${props.galgame.id}`,
  )

  const galleryRef = useTemplateRef<HTMLElement>('galleryRef')
  const { width } = useElementBounding(galleryRef)
  const effectiveWidth = computed(() => width.value || 1100)

  const rows = computed(() =>
    justifiedRows(
      images.value.map(image => ({
        item: image,
        ratio: image.width && image.height ? image.width / image.height : 16 / 9,
      })),
      effectiveWidth.value,
      { targetHeight: 200, gap: 8 },
    ),
  )

  const thumbProcessing = {
    width: 960,
    quality: 86,
    fit: 'scale-down',
    format: 'auto',
  } as const
</script>

<template>
  <WorkSection v-if="images.length" title="画廊" :meta="`${images.length} 张图片`">
    <Stack ref="galleryRef" gap="none" class="w-full">
      <HikariImageGroup class="flex flex-col gap-2">
        <Inline
          v-for="(row, index) in rows"
          :key="index"
          gap="none"
          align="stretch"
          :wrap="false"
          class="gap-2"
        >
          <HikariImage
            v-for="cell in row"
            :key="cell.item.id"
            :src="cell.item"
            :alt="`${title} 截图`"
            class="shrink-0 rounded-md border border-line bg-subtle"
            image-class="size-full object-cover"
            :style="{ width: `${cell.width}px`, height: `${cell.height}px` }"
            :processing="thumbProcessing"
            preview
          />
        </Inline>
      </HikariImageGroup>
    </Stack>
  </WorkSection>
</template>
