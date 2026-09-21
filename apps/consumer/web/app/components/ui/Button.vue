<script setup lang="ts">
  import { Button as HnButton } from '@hina-ui/vue'
  import type { Component } from 'vue'

  defineOptions({ name: 'HikariButton', inheritAttrs: false })

  const props = withDefaults(defineProps<{ loginRequired?: boolean }>(), { loginRequired: false })

  const Base = HnButton as Component

  defineSlots<{
    default?: () => unknown
    icon?: () => unknown
    trailing?: () => unknown
  }>()

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
  <Base v-bind="forwarded" @click="onClick">
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>

    <template v-if="$slots.default" #default>
      <slot />
    </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </Base>
</template>
