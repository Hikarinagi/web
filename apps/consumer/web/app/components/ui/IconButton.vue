<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'

  defineOptions({ name: 'HikariIconButton', inheritAttrs: false })

  const props = withDefaults(defineProps<{ label: string; loginRequired?: boolean }>(), {
    loginRequired: false,
  })

  const attrs = useAttrs()
  const { requireLogin } = useAuthGate()

  const forwarded = computed<Record<string, unknown>>(() => {
    const { onClick: _onClick, ...rest } = attrs
    return rest
  })

  function onClick(event: MouseEvent) {
    if (props.loginRequired && !requireLogin()) {
      event.preventDefault()
      return
    }

    const handler = attrs.onClick
    if (Array.isArray(handler)) {
      handler.forEach(fn => {
        if (typeof fn === 'function') fn(event)
      })
      return
    }
    if (typeof handler === 'function') handler(event)
  }
</script>

<template>
  <IconButton v-bind="forwarded" :label="props.label" @click="onClick">
    <slot />
  </IconButton>
</template>
