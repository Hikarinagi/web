import type { ReaderController } from '@ritojs/kit'
import { onBeforeUnmount, shallowRef, watch, type Ref, type ShallowRef } from 'vue'

interface UseReaderLinkPromptsOptions {
  controller: ShallowRef<ReaderController | null>
  currentSpread: Ref<number>
  suppressTap?: () => void
}

interface ReturnPrompt {
  id: number
  label: string
  spread: number
}

function labelFor(href: string) {
  return href.length > 96 ? `${href.slice(0, 93)}...` : href
}

function targetLabel(event: { resolvedLabel?: string; text: string; href: string }) {
  return labelFor(event.resolvedLabel || event.text || event.href)
}

export function useReaderLinkPrompts(options: UseReaderLinkPromptsOptions) {
  const confirm = useConfirm()
  const returnPrompt = shallowRef<ReturnPrompt | null>(null)
  let unsubscribe: (() => void) | null = null
  let promptId = 0
  let promptTimer: ReturnType<typeof setTimeout> | null = null

  function detach() {
    unsubscribe?.()
    unsubscribe = null
    clearPrompt()
  }

  function clearPrompt() {
    if (promptTimer) clearTimeout(promptTimer)
    promptTimer = null
    returnPrompt.value = null
  }

  function showPrompt(label: string, spread: number) {
    if (promptTimer) clearTimeout(promptTimer)
    returnPrompt.value = { id: ++promptId, label, spread }
    promptTimer = setTimeout(() => {
      returnPrompt.value = null
      promptTimer = null
    }, 8000)
  }

  function back() {
    const prompt = returnPrompt.value
    const controller = options.controller.value
    if (!prompt || !controller) return
    clearPrompt()
    controller.goToSpread(prompt.spread)
  }

  function attach(controller: ReaderController) {
    detach()
    unsubscribe = controller.on('linkClick', event => {
      options.suppressTap?.()
      if (event.type === 'external') {
        confirm.require({
          group: 'app-shell',
          header: '打开外部链接',
          message: `即将在新标签页打开：${labelFor(event.href)}`,
          rejectLabel: '取消',
          acceptLabel: '打开',
          defaultFocus: 'reject',
          onAccept: ({ close }) => {
            event.navigate()
            close()
          },
        })
        return
      }

      const previousSpread = options.currentSpread.value
      confirm.require({
        group: 'app-shell',
        header: '章节跳转',
        message: `即将跳转到：${targetLabel(event)}`,
        rejectLabel: '取消',
        acceptLabel: '跳转',
        defaultFocus: 'accept',
        onAccept: ({ close }) => {
          event.navigate()
          close()
          if (controller.currentSpread !== previousSpread) {
            showPrompt(targetLabel(event), previousSpread)
          }
        },
      })
    })
  }

  watch(
    () => options.controller.value,
    controller => {
      if (controller) attach(controller)
      else detach()
    },
    { immediate: true },
  )

  onBeforeUnmount(detach)

  return {
    returnPrompt,
    back,
    clearPrompt,
  }
}
