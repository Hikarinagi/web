<script setup lang="ts">
  import { Avatar as HnAvatar, Flex } from '@hina-ui/vue'
  import type { VNodeChild } from 'vue'
  import defaultAvatarImage from '~/assets/images/default-avatar.webp'
  import type { UserAvatarData } from '~/types/user'
  import type { HikariImagePresetName, HikariImageProcessing } from '~/utils/media/image'
  import { cn } from '#imports'

  interface HikariAvatarProps {
    user?: UserAvatarData | null
    image?: string
    size?: 'sm' | 'md' | 'lg'
    ariaLabel?: string
    fallbackSrc?: string
    imageClass?: string
    fallbackImageClass?: string
    lazy?: boolean
    rootMargin?: string
    preset?: HikariImagePresetName
    processing?: HikariImageProcessing
    preload?: boolean | { fetchPriority: 'high' | 'low' | 'auto' }
    card?: boolean
    cardShowOnClick?: boolean
    decoration?: boolean
    class?: string
  }

  defineOptions({
    name: 'HikariAvatar',
    inheritAttrs: false,
  })

  defineSlots<{
    default?: (props: Record<string, never>) => VNodeChild
  }>()

  const props = withDefaults(defineProps<HikariAvatarProps>(), {
    user: null,
    image: undefined,
    size: undefined,
    ariaLabel: undefined,
    fallbackSrc: '',
    imageClass: 'object-cover',
    fallbackImageClass: 'object-contain',
    lazy: true,
    rootMargin: '200px 0px',
    preset: 'avatar',
    processing: undefined,
    preload: false,
    card: false,
    decoration: true,
    class: undefined,
  })

  const attrs = useAttrs()
  const slots = useSlots()
  defineEmits<{
    error: []
  }>()

  const forwarded = computed<Record<string, unknown>>(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
  const resolvedImage = computed(() => props.image ?? props.user?.avatar?.src ?? undefined)
  const resolvedName = computed(() => (props.user ? displayName(props.user) : undefined))
  const resolvedAriaLabel = computed(() => props.ariaLabel ?? resolvedName.value)
  const shouldRenderImage = computed(() => !slots.default && Boolean(resolvedImage.value))
  const resolvedFallbackSrc = computed(() => props.fallbackSrc || defaultAvatarImage)
  const cardUserId = computed(() => props.user?.id)
  const cardEnabled = computed(() => Boolean(props.card && cardUserId.value))
  const frame = computed(() => (props.decoration ? (props.user?.equipped_frame ?? null) : null))
  const FRAME_SCALE = 1.34
  const frameScale = computed(() => frame.value?.scale ?? FRAME_SCALE)
</script>

<template>
  <UserCardTrigger :user-id="cardEnabled ? cardUserId : null" :show-on-click="cardShowOnClick">
    <Flex
      as="span"
      v-bind="forwarded"
      :aria-label="resolvedAriaLabel"
      :class="frame ? 'relative isolate inline-flex shrink-0' : 'contents'"
    >
      <HnAvatar
        :name="resolvedName"
        :alt="resolvedAriaLabel"
        :size="size"
        :class="cn(props.class, attrs.class as string)"
      >
        <slot v-if="slots.default" />
        <HikariImage
          v-else-if="shouldRenderImage"
          :src="resolvedImage"
          :alt="resolvedAriaLabel ?? ''"
          :fallback-src="resolvedFallbackSrc"
          :image-class="imageClass"
          :fallback-image-class="fallbackImageClass"
          :lazy="lazy"
          :root-margin="rootMargin"
          :skeleton="true"
          :preset="preset"
          :processing="processing"
          :preload="preload"
          class="size-full rounded-[inherit]"
          @error="$emit('error')"
        />
      </HnAvatar>

      <Flex
        v-if="frame"
        as="span"
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
          class="size-full"
        />
      </Flex>
    </Flex>
  </UserCardTrigger>
</template>
