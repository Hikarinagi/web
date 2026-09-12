<script setup lang="ts">
  import { Button, IconButton } from '@hina-ui/vue'

  defineOptions({ name: 'AuthGateButton', inheritAttrs: false })

  const props = withDefaults(defineProps<{ loginRequired?: boolean; label?: string }>(), {
    loginRequired: true,
    label: undefined,
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
  <IconButton v-if="label" v-bind="forwarded" :label="label" @click="onClick">
    <slot />
  </IconButton>

  <Button v-else v-bind="forwarded" @click="onClick">
    <template v-if="$slots.icon" #icon>
      <slot name="icon" />
    </template>

    <template v-if="$slots.default" #default>
      <slot />
    </template>

    <template v-if="$slots.trailing" #trailing>
      <slot name="trailing" />
    </template>
  </Button>
</template>
