<script setup lang="ts">
  import { motion } from 'motion-v'
  import type { $Transition } from 'motion-v'
  import type { ButtonProps } from 'primevue/button'
  import SpinnerIcon from '@primevue/icons/spinner'
  import { EASE } from '~/lib/motion'
  import ButtonIconContent from './IconContent.vue'
  import { cn } from '#imports'

  defineOptions({ name: 'HikariButtonLoadingIcon', inheritAttrs: false })
  const props = withDefaults(
    defineProps<{
      loading: boolean
      hasLabel: boolean
      hasTrailingContent: boolean
      icon?: string
      iconClass?: ButtonProps['iconClass']
      iconPosition?: string
      loadingIcon?: string
      size?: string
    }>(),
    {
      icon: '',
      iconClass: undefined,
      iconPosition: 'left',
      loadingIcon: '',
      size: '',
    },
  )
  const attrs = useAttrs()
  const slots = useSlots()
  const iconSize = '1em'
  const buttonGap = 'var(--p-button-gap, 0.5rem)'
  const rootTransition = {
    ease: EASE,
    opacity: { duration: 0.14 },
    scale: { duration: 0.18 },
    width: { duration: 0.16 },
    height: { duration: 0.16 },
    marginInlineStart: { duration: 0.16 },
    marginInlineEnd: { duration: 0.16 },
    marginBlockStart: { duration: 0.16 },
    marginBlockEnd: { duration: 0.16 },
  } as $Transition
  const fadeTransition = {
    opacity: { duration: 0.14 },
    scale: { duration: 0.18 },
  } as $Transition
  const spinTransition = { duration: 0.8, ease: 'linear', repeat: Infinity } as $Transition
  const noTransition = { duration: 0 } as $Transition
  const hasIcon = computed(() => Boolean(props.icon || slots.icon))
  const isVertical = computed(() => props.iconPosition === 'top' || props.iconPosition === 'bottom')
  const isAfter = computed(() => props.iconPosition === 'right' || props.iconPosition === 'bottom')
  const iconDataP = computed(() => [props.iconPosition, props.size].filter(Boolean).join(' '))
  const hasSyntheticGap = computed(() => !hasIcon.value && props.hasTrailingContent)
  const rootHiddenState = computed(() => ({
    opacity: hasIcon.value ? 1 : 0,
    scale: hasIcon.value ? 1 : 0.8,
    width: hasIcon.value || isVertical.value ? iconSize : '0rem',
    height: hasIcon.value || !isVertical.value ? iconSize : '0rem',
    marginInlineStart:
      hasSyntheticGap.value && !isVertical.value && isAfter.value
        ? `calc(-1 * ${buttonGap})`
        : '0rem',
    marginInlineEnd:
      hasSyntheticGap.value && !isVertical.value && !isAfter.value
        ? `calc(-1 * ${buttonGap})`
        : '0rem',
    marginBlockStart:
      hasSyntheticGap.value && isVertical.value && isAfter.value
        ? `calc(-1 * ${buttonGap})`
        : '0rem',
    marginBlockEnd:
      hasSyntheticGap.value && isVertical.value && !isAfter.value
        ? `calc(-1 * ${buttonGap})`
        : '0rem',
  }))
  const rootVisibleState = computed(() => ({
    opacity: hasIcon.value || props.loading ? 1 : 0,
    scale: hasIcon.value || props.loading ? 1 : 0.8,
    width: hasIcon.value || props.loading || isVertical.value ? iconSize : '0rem',
    height: hasIcon.value || props.loading || !isVertical.value ? iconSize : '0rem',
    marginInlineStart: '0rem',
    marginInlineEnd: '0rem',
    marginBlockStart: '0rem',
    marginBlockEnd: '0rem',
  }))
  const rootState = computed(() => (props.loading ? rootVisibleState.value : rootHiddenState.value))
  const spinnerState = computed(() => ({
    opacity: props.loading ? 1 : 0,
    scale: props.loading ? 1 : 0.98,
  }))
  const spinnerInitialState = { opacity: 0, scale: 0.98 }
  const iconState = computed(() => ({
    opacity: props.loading ? 0 : 1,
    scale: props.loading ? 0.98 : 1,
  }))
  const iconInitialState = { opacity: 1, scale: 1 }
</script>

<template>
  <motion.span
    :class="
      cn(
        attrs.class,
        'relative inline-flex shrink-0 origin-center items-center justify-center',
        'overflow-visible',
      )
    "
    :initial="rootHiddenState"
    :animate="rootState"
    :transition="rootTransition"
    aria-hidden="true"
  >
    <motion.span
      :class="[
        'inline-flex shrink-0 origin-center items-center justify-center',
        hasIcon ? 'absolute inset-0 size-full' : 'size-[1em]',
      ]"
      :initial="spinnerInitialState"
      :animate="spinnerState"
      :transition="fadeTransition"
    >
      <motion.span
        :class="[
          'inline-flex shrink-0 origin-center items-center justify-center',
          hasIcon ? 'size-full' : 'size-[1em]',
        ]"
        :animate="{ rotate: loading ? 360 : 0 }"
        :transition="loading ? spinTransition : noTransition"
      >
        <slot name="loadingicon" v-bind="attrs">
          <span v-if="loadingIcon" :class="loadingIcon" />
          <SpinnerIcon v-else :class="hasIcon ? 'size-full' : 'size-[0.875em]'" />
        </slot>
      </motion.span>
    </motion.span>
    <motion.span
      v-if="hasIcon"
      class="relative inline-flex size-[1em] shrink-0 items-center justify-center overflow-visible"
      :initial="iconInitialState"
      :animate="iconState"
      :transition="fadeTransition"
    >
      <ButtonIconContent>
        <slot name="icon">
          <span v-if="icon" :class="[icon, iconClass]" :data-p="iconDataP" />
        </slot>
      </ButtonIconContent>
    </motion.span>
  </motion.span>
</template>
