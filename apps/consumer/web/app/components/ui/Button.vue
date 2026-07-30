<script setup lang="ts">
  import type { ButtonProps } from 'primevue/button'
  import PrimeButton from 'primevue/button'
  import { EASE_CSS } from '~/lib/motion'
  import ButtonLoadingIcon from './button/LoadingIcon.vue'

  defineOptions({
    name: 'HikariButton',
    inheritAttrs: false,
  })

  const props = withDefaults(defineProps<{ loginRequired?: boolean }>(), {
    loginRequired: false,
  })

  const attrs = useAttrs()
  const slots = useSlots()
  const auth = useAuthStore()
  const { toLogin } = useAuthGate()
  const { currentPath } = useAuthReturn()

  const loading = computed(
    () => attrs.loading === '' || attrs.loading === true || attrs.loading === 'true',
  )
  const disabled = computed(
    () => attrs.disabled === '' || attrs.disabled === true || attrs.disabled === 'true',
  )

  const forwardedAttrs = computed(() => {
    const {
      class: className,
      disabled: _disabled,
      loading: _loading,
      onClick: _onClick,
      ...rest
    } = attrs
    return {
      ...rest,
      class: ['hikari-button', className],
      disabled: disabled.value || loading.value,
      loading: false,
    }
  })

  const loadingIcon = computed(() => String(attrs.loadingIcon ?? attrs['loading-icon'] ?? ''))
  const icon = computed(() => String(attrs.icon ?? ''))
  const iconClass = computed(
    () => (attrs.iconClass ?? attrs['icon-class']) as ButtonProps['iconClass'],
  )
  const iconPosition = computed(() => String(attrs.iconPos ?? attrs['icon-pos'] ?? 'left'))
  const size = computed(() => String(attrs.size ?? ''))

  const hasLabel = computed(() => Boolean(attrs.label))
  const hasTrailingContent = computed(() => Boolean(attrs.label || attrs.badge))
  const iconProps = computed(() => ({
    hasLabel: hasLabel.value,
    hasTrailingContent: hasTrailingContent.value,
    icon: icon.value,
    iconClass: iconClass.value,
    iconPosition: iconPosition.value,
    loadingIcon: loadingIcon.value,
    size: size.value,
  }))
  const shouldRenderIconSlot = computed(() => !slots.default || Boolean(slots.icon || icon.value))

  function handleClick(event: MouseEvent) {
    if (disabled.value || loading.value) {
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (props.loginRequired && !auth.isAuthenticated) {
      event.preventDefault()
      event.stopPropagation()
      toLogin('login', currentPath.value)
      return
    }
    const onClick = attrs.onClick
    if (Array.isArray(onClick)) {
      onClick.forEach(handler => {
        if (typeof handler === 'function') handler(event)
      })
      return
    }
    if (typeof onClick === 'function') {
      onClick(event)
    }
  }
</script>

<template>
  <PrimeButton v-bind="forwardedAttrs" @click="handleClick">
    <template v-if="$slots.default" #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
    <template v-if="shouldRenderIconSlot" #icon="slotProps">
      <ButtonLoadingIcon v-bind="{ ...slotProps, ...iconProps }" :loading="loading">
        <template v-if="$slots.loadingicon" #loadingicon="loadingIconSlotProps">
          <slot name="loadingicon" v-bind="loadingIconSlotProps" />
        </template>
        <template v-if="$slots.icon" #icon="iconSlotProps">
          <slot name="icon" v-bind="iconSlotProps" />
        </template>
      </ButtonLoadingIcon>
    </template>
  </PrimeButton>
</template>

<style scoped>
  .hikari-button {
    transition:
      background var(--p-button-transition-duration, 0.2s),
      color var(--p-button-transition-duration, 0.2s),
      border-color var(--p-button-transition-duration, 0.2s),
      outline-color var(--p-button-transition-duration, 0.2s),
      box-shadow var(--p-button-transition-duration, 0.2s),
      opacity 0.2s v-bind(EASE_CSS);
  }

  .hikari-button.p-button-icon-only::after {
    content: none;
  }
</style>
