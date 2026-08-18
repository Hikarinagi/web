<script setup lang="ts">
  import { X } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { PromoBanner } from '~/features/promotion/placement'
  import { useBannerDismiss } from '~/features/promotion/composables/useBannerDismiss'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'PromotionBanner' })

  const props = defineProps<{ banner: PromoBanner }>()

  const { isDismissed, dismiss } = useBannerDismiss()
  const visible = computed(() => !isDismissed(props.banner.id))

  const CLOSE_BTN =
    'grid size-7 place-items-center rounded-full bg-black/45 text-white transition-colors hover:bg-black/65'

  const aspectStyle = computed(() => {
    const { width, height } = props.banner.image
    return width && height ? { aspectRatio: `${width} / ${height}` } : undefined
  })

  const inner = useTemplateRef<HTMLElement>('inner')
  const exitSpacing = ref<Record<string, string>>({})

  function gapCollapse(): Record<string, string> {
    const item = inner.value?.parentElement
    const container = item?.parentElement
    if (!item || !container || container.children.length < 2) return {}

    const gap = Number.parseFloat(getComputedStyle(container).rowGap)
    if (!Number.isFinite(gap) || gap <= 0) return {}

    return item.nextElementSibling ? { marginBottom: `-${gap}px` } : { marginTop: `-${gap}px` }
  }

  const exitTo = computed(() => ({ height: 0, opacity: 0, ...exitSpacing.value }))

  async function close() {
    exitSpacing.value = gapCollapse()
    await nextTick()
    dismiss(props.banner.id)
  }
</script>

<template>
  <AnimatePresence :initial="false">
    <motion.div
      v-if="visible"
      key="banner"
      :exit="exitTo"
      :transition="TRANSITION"
      class="overflow-hidden"
    >
      <div ref="inner" class="relative">
        <NuxtLink
          :to="banner.link"
          :target="banner.open_in_new ? '_blank' : undefined"
          class="block overflow-hidden rounded-2xl border border-surface"
          :style="aspectStyle"
        >
          <HikariImage
            :src="banner.image"
            :alt="banner.title ?? ''"
            :class="aspectStyle ? 'size-full' : 'w-full'"
            :image-class="aspectStyle ? 'size-full object-cover' : 'h-auto w-full'"
            :skeleton="false"
          />
        </NuxtLink>

        <Tag
          value="广告"
          class="pointer-events-none absolute bottom-2 left-2 z-1 bg-black/55! text-white!"
        />

        <div class="absolute top-2 right-2 z-1">
          <Button unstyled :class="CLOSE_BTN" aria-label="关闭广告" @click="close">
            <template #icon><X :size="14" /></template>
          </Button>
        </div>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
