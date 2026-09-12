<script setup lang="ts">
  import { IconButton, Tag } from '@hina-ui/vue'
  import { X } from '@lucide/vue'
  import { AnimatePresence, motion } from 'motion-v'
  import type { PromoBanner } from '~/features/promotion/placement'
  import { useBannerDismiss } from '~/features/promotion/composables/useBannerDismiss'
  import { TRANSITION } from '~/lib/motion'

  defineOptions({ name: 'PromotionBanner' })

  const props = defineProps<{ banner: PromoBanner }>()

  const { isDismissed, dismiss } = useBannerDismiss()
  const visible = computed(() => !isDismissed(props.banner.id))

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

        <Tag class="pointer-events-none absolute bottom-2 left-2 z-1">广告</Tag>

        <IconButton
          label="关闭广告"
          variant="solid"
          tone="neutral"
          size="sm"
          pill
          class="absolute top-2 right-2 z-1"
          @click="close"
        >
          <X />
        </IconButton>
      </div>
    </motion.div>
  </AnimatePresence>
</template>
