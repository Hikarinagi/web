<script setup lang="ts">
  import { Button, DropdownMenu, DropdownMenuItem, IconButton, toast } from '@hina-ui/vue'
  import { Check, Copy, Share2 } from '@lucide/vue'
  import { useClipboard } from '@vueuse/core'

  defineOptions({ name: 'ShareButton', inheritAttrs: false })

  const props = withDefaults(
    defineProps<{
      to?: string
      url?: string
      copyLabel?: string
      ariaLabel?: string
      tooltip?: string | null
    }>(),
    {
      to: undefined,
      url: undefined,
      copyLabel: '复制链接',
      ariaLabel: '分享',
      tooltip: null,
    },
  )

  const route = useRoute()
  const { copy, copied, isSupported } = useClipboard({ legacy: true })

  function shareUrl() {
    const raw = props.url || props.to || route.fullPath
    if (!import.meta.client) return raw
    return new URL(raw, window.location.origin).toString()
  }

  async function copyLink() {
    if (!isSupported.value) {
      toast.danger('复制失败')
      return
    }

    await copy(shareUrl())
    toast.success('链接已复制')
  }
</script>

<template>
  <DropdownMenu :label="ariaLabel" align="end">
    <Button v-if="$slots.default" v-bind="$attrs" :aria-label="ariaLabel">
      <slot />
    </Button>
    <IconButton v-else v-bind="$attrs" :label="tooltip ?? ariaLabel" side="bottom">
      <Share2 />
    </IconButton>

    <template #content>
      <DropdownMenuItem @select="copyLink">
        <template #icon>
          <Check v-if="copied" />
          <Copy v-else />
        </template>
        {{ copyLabel }}
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>
