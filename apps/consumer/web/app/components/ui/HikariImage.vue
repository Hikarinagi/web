<script setup lang="ts">
  import type { VNodeChild } from 'vue'
  import { Image } from '@hina-ui/vue'
  import defaultFallbackImage from '~/assets/images/404/shion-image-404.webp'
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
      ratio?: number
      skeleton?: boolean
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
      ratio: undefined,
      skeleton: true,
      preset: undefined,
      processing: undefined,
      preload: false,
      preview: false,
      nsfw: false,
      sexual: 0,
      violence: 0,
    },
  )

  const emit = defineEmits<{
    load: [size: { width: number; height: number }]
    error: []
  }>()

  const config = useRuntimeConfig()
  const fallbackActive = ref(false)

  // 门禁判据集中在此：作品级 nsfw 或逐图分级(sexual/violence)任一命中即按 NSFW 处理。
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
  // nsfw 需模糊但该图无法走处理器(未登记外链等)→ 处理器加不上 blur,绝不直出原图；
  // fail-closed 当作 block 处理(不加载原图，显示 fallback),避免静默裸露。
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
  const originalSrc = computed(() =>
    resolveImageUrl(sourceSrc.value, {
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
  const isFallbackImage = computed(
    () => Boolean(fallbackSrc.value) && resolvedSrc.value === fallbackSrc.value,
  )
  const resolvedImageClass = computed(() =>
    isFallbackImage.value ? props.fallbackImageClass : props.imageClass,
  )
  const eager = computed(() => !props.lazy || Boolean(props.preload))
  const previewSrc = computed<string | false>(() => {
    if (!props.preview || blurNsfw.value || fallbackActive.value || !mainSrc.value) return false
    return originalSrc.value || mainSrc.value
  })

  watch(mainSrc, () => {
    fallbackActive.value = false
  })

  if (props.preload) {
    const fetchpriority =
      typeof props.preload === 'object' ? props.preload.fetchPriority : undefined
    useHead(() => ({
      link: resolvedSrc.value
        ? [{ rel: 'preload', as: 'image', href: resolvedSrc.value, fetchpriority }]
        : [],
    }))
  }

  function onError() {
    if (!fallbackActive.value && fallbackSrc.value && resolvedSrc.value !== fallbackSrc.value) {
      fallbackActive.value = true
      return
    }

    emit('error')
  }
</script>

<template>
  <Image
    class="isolate"
    v-bind="$attrs"
    :src="resolvedSrc"
    :alt="alt"
    :image-class="resolvedImageClass"
    :lazy="lazy"
    :root-margin="rootMargin"
    :ratio="ratio"
    :skeleton="skeleton"
    :eager="eager"
    :preview="previewSrc"
    :draggable="draggable"
    @load="size => emit('load', size)"
    @error="onError"
  >
    <template v-if="$slots.empty" #empty>
      <slot name="empty" />
    </template>

    <template v-if="$slots.error" #error>
      <slot name="error" />
    </template>

    <template v-if="$slots.skeleton" #skeleton>
      <slot name="skeleton" />
    </template>
  </Image>
</template>
