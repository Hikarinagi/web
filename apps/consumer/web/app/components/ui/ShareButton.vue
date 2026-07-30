<script setup lang="ts">
  import { Check, Copy, Share2 } from '@lucide/vue'
  import { push } from 'notivue'
  import type Popover from 'primevue/popover'

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
  const pop = ref<InstanceType<typeof Popover> | null>(null)
  const copied = ref(false)

  function shareUrl() {
    const raw = props.url || props.to || route.fullPath
    if (!import.meta.client) return raw
    return new URL(raw, window.location.origin).toString()
  }

  function toggle(event: MouseEvent) {
    pop.value?.toggle(event)
  }

  async function write(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.readOnly = true
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand('copy')
    textarea.remove()
    if (!ok) throw new Error('copy failed')
  }

  async function copyLink() {
    try {
      await write(shareUrl())
      copied.value = true
      pop.value?.hide()
      push.success({ message: '链接已复制' })
      window.setTimeout(() => {
        copied.value = false
      }, 1200)
    } catch {
      push.error({ message: '复制失败' })
    }
  }
</script>

<template>
  <span class="inline-flex">
    <Button v-tooltip.bottom="tooltip" v-bind="$attrs" :aria-label="ariaLabel" @click="toggle">
      <template v-if="$slots.default" #default>
        <slot />
      </template>
      <template v-if="!$slots.default" #icon>
        <Share2 class="size-[1em]" />
      </template>
    </Button>

    <Popover ref="pop" :pt="{ root: { class: 'popover-no-arrow' }, content: { class: 'p-1!' } }">
      <div class="flex min-w-36 flex-col">
        <Button
          unstyled
          class="flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-color transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
          @click="copyLink"
        >
          <template #default>
            <Check v-if="copied" class="size-4 shrink-0 text-hikari-primary-600" />
            <Copy v-else class="size-4 shrink-0" />
            <span>{{ copyLabel }}</span>
          </template>
        </Button>
      </div>
    </Popover>
  </span>
</template>
