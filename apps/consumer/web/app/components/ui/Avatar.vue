<script setup lang="ts">
  import type { VNodeChild } from 'vue'
  import type { AvatarProps } from 'primevue/avatar'
  import PrimeAvatar from 'primevue/avatar'
  import defaultAvatarImage from '~/assets/images/default-avatar.webp'
  import type { UserAvatarData } from '~/types/user'
  import type { HikariImagePresetName, HikariImageProcessing } from '~/utils/media/image'
  import { cn } from '#imports'

  interface HikariAvatarProps extends AvatarProps {
    user?: UserAvatarData | null
    fallbackSrc?: string
    imageClass?: string
    fallbackImageClass?: string
    lazy?: boolean
    rootMargin?: string
    skeletonClass?: string
    preset?: HikariImagePresetName
    processing?: HikariImageProcessing
    preload?: boolean | { fetchPriority: 'high' | 'low' | 'auto' }
    card?: boolean
    cardShowOnClick?: boolean
    decoration?: boolean
  }

  defineOptions({
    name: 'HikariAvatar',
    inheritAttrs: false,
  })

  defineSlots<{
    default?: (props: Record<string, never>) => VNodeChild
    icon?: (props: Record<string, never>) => VNodeChild
  }>()

  const props = withDefaults(defineProps<HikariAvatarProps>(), {
    user: null,
    fallbackSrc: '',
    imageClass: 'object-cover',
    fallbackImageClass: 'object-contain',
    lazy: true,
    rootMargin: '200px 0px',
    skeletonClass: '',
    preset: 'avatar',
    processing: undefined,
    preload: false,
    card: false,
    decoration: true,
  })

  const attrs = useAttrs()
  const slots = useSlots()
  const emit = defineEmits<{
    error: [event: string | Event]
  }>()

  const resolvedImage = computed(() => props.image ?? props.user?.avatar?.src ?? undefined)
  const resolvedLabel = computed(() => {
    if (resolvedImage.value) return undefined
    if (props.label !== undefined) return props.label
    return props.user ? displayName(props.user).slice(0, 1) : undefined
  })
  const resolvedAriaLabel = computed(
    () => props.ariaLabel ?? (props.user ? displayName(props.user) : undefined),
  )
  const forwardedAttrs = computed(() => ({
    ...attrs,
    label: resolvedLabel.value,
    icon: props.icon,
    image: resolvedImage.value,
    size: props.size,
    shape: props.shape,
    ariaLabel: resolvedAriaLabel.value,
    ariaLabelledby: props.ariaLabelledby,
    dt: props.dt,
    pt: props.pt,
    ptOptions: props.ptOptions,
    unstyled: props.unstyled,
  }))
  const shouldRenderImage = computed(
    () =>
      !slots.default &&
      !resolvedLabel.value &&
      !slots.icon &&
      !props.icon &&
      Boolean(resolvedImage.value),
  )
  const imageAlt = computed(() => resolvedAriaLabel.value ?? '')
  const resolvedFallbackSrc = computed(() => props.fallbackSrc || defaultAvatarImage)
  const skeletonShape = computed(() => (props.shape === 'circle' ? 'circle' : 'rectangle'))
  const cardUserId = computed(() => props.user?.id)
  const cardEnabled = computed(() => Boolean(props.card && cardUserId.value))
  const frame = computed(() => (props.decoration ? (props.user?.equipped_frame ?? null) : null))
  const FRAME_SCALE = 1.34
  const frameScale = computed(() => frame.value?.scale ?? FRAME_SCALE)

  function handleImageError(event: string | Event) {
    emit('error', event)
  }
</script>

<template>
  <UserCardTrigger :user-id="cardEnabled ? cardUserId : null" :show-on-click="cardShowOnClick">
    <span :class="frame ? 'relative inline-flex shrink-0' : 'contents'">
      <PrimeAvatar v-bind="forwardedAttrs">
        <template v-if="$slots.default" #default>
          <slot />
        </template>

        <template v-else-if="shouldRenderImage" #default>
          <HikariImage
            :src="resolvedImage"
            :alt="imageAlt"
            :fallback-src="resolvedFallbackSrc"
            :image-class="imageClass"
            :fallback-image-class="fallbackImageClass"
            :lazy="lazy"
            :root-margin="rootMargin"
            :skeleton="true"
            :skeleton-shape="skeletonShape"
            :skeleton-class="skeletonClass"
            :preset="preset"
            :processing="processing"
            :preload="preload"
            :class="cn('h-full w-full rounded-[inherit]', shape === 'circle' && 'rounded-full')"
            @error="handleImageError"
          />
        </template>

        <template v-if="$slots.icon" #icon>
          <slot name="icon" />
        </template>
      </PrimeAvatar>

      <span
        v-if="frame"
        class="pointer-events-none absolute inset-0 z-10"
        :style="{ transform: `scale(${frameScale})` }"
      >
        <HikariImage
          :src="frame.image.src"
          alt=""
          :lazy="lazy"
          :root-margin="rootMargin"
          :skeleton="false"
          :preview="false"
          :draggable="false"
          image-class="object-contain"
          class="h-full w-full"
        />
      </span>
    </span>
  </UserCardTrigger>
</template>
