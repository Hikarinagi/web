<script setup lang="ts">
  import type { VNodeChild } from 'vue'
  import type { SkeletonProps } from 'primevue/skeleton'
  import defaultFallbackImage from '~/assets/images/404/shion-image-404.webp'
  import { cn } from '~/utils/cn'
  import type {
    HikariImagePresetName,
    HikariImageProcessing,
    HikariImageProcessingOptions,
    HikariImageSource,
  } from '~/utils/media/image'
  import {
    canProcessImage,
    imageSourceSafety,
    imageSourceSrc,
    resolveImageUrl,
  } from '~/utils/media/image'
  import {
    HIKARI_IMAGE_GROUP_KEY,
    useHikariImagePreview,
  } from './hikari-image/composables/usePreview'

  const NSFW_SPOILER_BLUR = 100

  defineOptions({ name: 'HikariImage', inheritAttrs: false })
  const slots = defineSlots<{
    skeleton?: (props: Record<string, never>) => VNodeChild
    empty?: (props: Record<string, never>) => VNodeChild
    error?: (props: Record<string, never>) => VNodeChild
  }>()

  const props = withDefaults(
    defineProps<{
      src?: HikariImageSource
      alt?: string
      fallbackSrc?: string
      imageClass?: string
      fallbackImageClass?: string
      lazy?: boolean
      rootMargin?: string
      skeleton?: boolean
      skeletonClass?: string
      skeletonShape?: SkeletonProps['shape']
      skeletonRadius?: string | undefined
      preset?: HikariImagePresetName
      processing?: HikariImageProcessing
      preload?: boolean | { fetchPriority: 'high' | 'low' | 'auto' }
      preview?: boolean
      draggable?: boolean
      nsfw?: boolean
      sexual?: number
      violence?: number
    }>(),
    {
      src: '',
      alt: '',
      fallbackSrc: '',
      imageClass: '',
      fallbackImageClass: 'object-contain',
      lazy: true,
      rootMargin: '200px 0px',
      skeleton: true,
      skeletonClass: '',
      skeletonRadius: undefined,
      skeletonShape: 'rectangle',
      preset: undefined,
      processing: undefined,
      preload: false,
      preview: false,
      nsfw: false,
      sexual: 0,
      violence: 0,
    },
  )

  const attrs = useAttrs()
  const config = useRuntimeConfig()
  const rootRef = ref<HTMLElement | null>(null)
  const entered = ref(!props.lazy)
  const imageVisible = ref(false)
  const skeletonVisible = ref(true)
  const failed = ref(false)
  const fallbackActive = ref(false)
  const emit = defineEmits<{
    load: [event: Event]
    error: [event: string | Event]
  }>()
  let observer: IntersectionObserver | null = null
  let revealFrame: number | null = null
  let skeletonTimer: ReturnType<typeof setTimeout> | null = null

  // 门禁判据集中在此:作品级 nsfw 或逐图分级(sexual/violence)任一命中即按 NSFW 处理。
  // content_limit 策略仍由 useNsfwPolicy 统一裁决(block / blur / 显示)。
  const { shouldBlockNsfw, shouldBlurNsfw } = useNsfwPolicy()
  const sourceSrc = computed(() => imageSourceSrc(props.src))
  const sourceSafety = computed(() => imageSourceSafety(props.src))
  const isNsfw = computed(
    () =>
      props.nsfw ||
      sourceSafety.value.nsfw ||
      props.sexual > 0 ||
      props.violence > 0 ||
      sourceSafety.value.sexual > 0 ||
      sourceSafety.value.violence > 0,
  )
  const blockNsfw = computed(() => shouldBlockNsfw(isNsfw))
  const blurNsfw = computed(() => !blockNsfw.value && shouldBlurNsfw(isNsfw))
  const mainProcessing = computed<HikariImageProcessing | undefined>(() => {
    if (!blurNsfw.value) return props.processing

    const processing: HikariImageProcessingOptions =
      props.processing && typeof props.processing === 'object' ? props.processing : {}

    return {
      ...processing,
      blur: Math.max(processing.blur ?? 0, NSFW_SPOILER_BLUR),
    }
  })

  const rawMainSrc = computed(() =>
    resolveImageUrl(sourceSrc.value, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      preset: props.preset,
      processing: mainProcessing.value,
    }),
  )
  // nsfw 需模糊但该图无法走处理器(未登记外链等)→ 处理器加不上 blur,绝不直出原图;
  // fail-closed 当作 block 处理(不加载原图,显示 fallback),避免静默裸露。
  const unsafeNsfwBlur = computed(
    () =>
      blurNsfw.value &&
      !canProcessImage(sourceSrc.value, {
        cdnHost: config.public.cdnHost,
        imageProcessorHost: config.public.imageProcessorHost,
      }),
  )
  const mainSrc = computed(() => (blockNsfw.value || unsafeNsfwBlur.value ? '' : rawMainSrc.value))
  const fallbackSrc = computed(() =>
    resolveImageUrl(props.fallbackSrc || defaultFallbackImage, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    }),
  )
  const showEmpty = computed(() => !mainSrc.value && Boolean(slots.empty))
  const resolvedSrc = computed(() => {
    if (showEmpty.value) return ''
    if (fallbackActive.value || !mainSrc.value) return fallbackSrc.value
    return mainSrc.value
  })
  const imageAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs

    return {
      loading: props.lazy ? 'lazy' : 'eager',
      decoding: props.lazy ? 'async' : 'sync',
      ...rest,
    }
  })
  const showImage = computed(() => Boolean(resolvedSrc.value) && entered.value && !failed.value)
  const showSkeleton = computed(
    () => props.skeleton && Boolean(resolvedSrc.value) && skeletonVisible.value && !failed.value,
  )
  const isFallbackImage = computed(
    () => Boolean(fallbackSrc.value) && resolvedSrc.value === fallbackSrc.value,
  )
  const imageTransitionClass = computed(() =>
    props.lazy
      ? [
          'transition-opacity duration-300 ease-out',
          imageVisible.value ? 'opacity-100' : 'opacity-0',
        ]
      : [],
  )
  const resolvedImageClass = computed(() =>
    isFallbackImage.value ? props.fallbackImageClass : props.imageClass,
  )

  const previewId = useId()
  const group = inject(HIKARI_IMAGE_GROUP_KEY, null)
  const soloPreview = useHikariImagePreview()
  const naturalWidth = ref<number | undefined>(undefined)
  const naturalHeight = ref<number | undefined>(undefined)
  const originalSrc = computed(() =>
    resolveImageUrl(sourceSrc.value, {
      cdnHost: config.public.cdnHost,
      imageProcessorHost: config.public.imageProcessorHost,
      processing: false,
    }),
  )
  const previewItem = computed(() => ({
    id: previewId,
    displaySrc: mainSrc.value,
    originalSrc: originalSrc.value || mainSrc.value,
    alt: props.alt,
    processing: props.processing,
    naturalWidth: naturalWidth.value,
    naturalHeight: naturalHeight.value,
  }))
  const canPreview = computed(
    () =>
      props.preview &&
      Boolean(mainSrc.value) &&
      imageVisible.value &&
      !fallbackActive.value &&
      !failed.value &&
      !blurNsfw.value,
  )

  watchEffect(() => {
    if (!group) return
    if (canPreview.value) group.register(previewItem.value)
    else group.unregister(previewId)
  })

  onBeforeUnmount(() => {
    group?.unregister(previewId)
  })

  function openPreview(event: MouseEvent) {
    if (!canPreview.value) return
    event.preventDefault()
    event.stopPropagation()
    if (group) group.open(previewId)
    else soloPreview.open([previewItem.value], 0)
  }

  watch(
    () => [mainSrc.value, fallbackSrc.value],
    () => {
      if (revealFrame !== null) window.cancelAnimationFrame(revealFrame)
      if (skeletonTimer !== null) clearTimeout(skeletonTimer)
      revealFrame = null
      skeletonTimer = null
      imageVisible.value = false
      skeletonVisible.value = true
      failed.value = false
      fallbackActive.value = false
      naturalWidth.value = undefined
      naturalHeight.value = undefined
      if (!props.lazy) entered.value = true
    },
  )

  watch(
    () => props.lazy,
    lazy => {
      if (!lazy) entered.value = true
    },
    { immediate: true },
  )

  onMounted(() => {
    if (!props.lazy || entered.value) return
    if (!('IntersectionObserver' in window)) {
      entered.value = true
      return
    }

    observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return
        entered.value = true
        observer?.disconnect()
        observer = null
      },
      { rootMargin: props.rootMargin },
    )

    if (rootRef.value) observer.observe(rootRef.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
    if (revealFrame !== null) window.cancelAnimationFrame(revealFrame)
    if (skeletonTimer !== null) clearTimeout(skeletonTimer)
  })

  function handleLoad(event: Event) {
    if (revealFrame !== null) window.cancelAnimationFrame(revealFrame)
    if (skeletonTimer !== null) clearTimeout(skeletonTimer)
    revealFrame = null
    skeletonTimer = null
    failed.value = false

    const img = event.target as HTMLImageElement
    if (img?.naturalWidth && img?.naturalHeight) {
      naturalWidth.value = img.naturalWidth
      naturalHeight.value = img.naturalHeight
    }

    if (!props.lazy) {
      imageVisible.value = true
      skeletonVisible.value = false
      emit('load', event)
      return
    }

    revealFrame = window.requestAnimationFrame(() => {
      revealFrame = window.requestAnimationFrame(() => {
        imageVisible.value = true
        revealFrame = null
        skeletonTimer = setTimeout(() => {
          skeletonVisible.value = false
          skeletonTimer = null
        }, 220)
      })
    })

    emit('load', event)
  }

  function handleError(event: string | Event) {
    if (!fallbackActive.value && fallbackSrc.value && resolvedSrc.value !== fallbackSrc.value) {
      fallbackActive.value = true
      imageVisible.value = false
      skeletonVisible.value = true
      return
    }

    failed.value = true
    imageVisible.value = false
    emit('error', event)
  }
</script>

<template>
  <span
    ref="rootRef"
    :class="cn('relative block overflow-hidden', canPreview && 'cursor-zoom-in', attrs.class)"
    :style="attrs.style"
    :data-hikari-image-id="canPreview ? previewId : undefined"
    @click="openPreview"
  >
    <slot v-if="showEmpty" name="empty" />

    <span
      v-if="showSkeleton"
      aria-hidden="true"
      :class="
        cn(
          'pointer-events-none absolute inset-0 transition-opacity duration-200 ease-out',
          imageVisible ? 'opacity-0' : 'opacity-100',
        )
      "
    >
      <slot name="skeleton">
        <Skeleton
          :shape="skeletonShape"
          :class="cn('h-full! w-full!', skeletonClass)"
          :border-radius="skeletonRadius"
        />
      </slot>
    </span>

    <NuxtImg
      v-if="showImage"
      v-bind="imageAttrs"
      provider="none"
      :src="resolvedSrc"
      :alt="alt"
      :preload="preload"
      :draggable="draggable"
      :class="cn('block h-full w-full', imageTransitionClass, resolvedImageClass)"
      @load="handleLoad"
      @error="handleError"
    />

    <slot v-else-if="failed" name="error" />
  </span>
</template>
