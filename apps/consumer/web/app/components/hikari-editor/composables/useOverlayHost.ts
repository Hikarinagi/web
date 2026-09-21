import type { Component } from 'vue'
import { EDITOR_PLUGIN_CONTEXT_KEY, type EditorOverlay, type EditorPlugin } from '../plugins/types'
import { useCommandMenu } from '../plugins/command/composables/useCommandMenu'
import { useMentionSuggestion } from '../plugins/mention/composables/useMentionSuggestion'
import { useEditorOverlays } from './useEditorOverlays'

function normalize(
  entry: Component | EditorOverlay,
  fallbackTitle: string,
): Required<EditorOverlay> {
  const overlay = 'component' in entry ? entry : { component: entry }
  return {
    component: overlay.component,
    presentation: overlay.presentation ?? 'anchored',
    scroll: overlay.scroll ?? 'host',
    title: overlay.title ?? fallbackTitle,
  }
}

export function useOverlayHost(plugins: () => EditorPlugin[]) {
  const { active, closeOverlay } = useEditorOverlays()

  // 本 host 所属编辑器实例的归属标识(由所在编辑器 provide)。host 只认属于自己实例(或未归属)的
  // 弹层；别的编辑器打开的弹层一律视而不见 —— 同页多编辑器各管各的，无需上层 gate。
  const ownerId = inject(EDITOR_PLUGIN_CONTEXT_KEY, null)?.ownerId
  const mineActive = computed(() => {
    const cur = active.value
    if (!cur) return null
    return !cur.ownerId || cur.ownerId === ownerId ? cur : null
  })

  const narrow = useNarrow()

  // keepalive 下被缓存的 host(如首页内联编辑器)deactivate 后不再响应共享的 active 单例，
  // 否则会与当前活跃页的编辑器抢 overlay。
  const activated = ref(true)
  onActivated(() => {
    activated.value = true
  })
  onDeactivated(() => {
    activated.value = false
  })

  const overlayMap = computed(() => {
    const m = new Map<string, Required<EditorOverlay>>()
    for (const p of plugins()) {
      if (!p.overlays) continue
      const fallbackTitle = p.toolbarItem?.tooltip ?? ''
      for (const [id, entry] of Object.entries(p.overlays))
        m.set(id, normalize(entry, fallbackTitle))
    }
    return m
  })

  const renderedComp = shallowRef<Component | null>(null)
  const renderedProps = shallowRef<Record<string, unknown>>({})
  const title = ref('')
  const presentation = ref<'anchored' | 'dialog'>('anchored')
  const scroll = ref<'host' | 'self'>('host')
  const overlayKey = ref(0)

  watch(mineActive, cur => {
    if (!activated.value || !cur) return
    const entry = overlayMap.value.get(cur.id)
    if (!entry) return
    renderedComp.value = entry.component
    renderedProps.value = cur.props
    title.value = entry.title
    presentation.value = entry.presentation
    scroll.value = entry.scroll
    overlayKey.value += 1
  })

  const open = computed({
    get: () => activated.value && !!mineActive.value && !!renderedComp.value,
    set: value => {
      if (!value && mineActive.value) closeOverlay()
    },
  })
  const anchor = computed(() => mineActive.value?.anchor ?? null)

  const { session, highlighted, hide, commit } = useCommandMenu()
  const command = computed(() => {
    const current = session.value
    if (!activated.value || !current) return null
    return current.ownerId === ownerId ? current : null
  })
  const commandOpen = computed({
    get: () => command.value !== null,
    set: value => {
      if (!value) hide()
    },
  })

  const {
    session: mentionSession,
    highlighted: mentionHighlighted,
    hide: mentionHide,
    commit: mentionCommit,
  } = useMentionSuggestion()
  const mention = computed(() => {
    const current = mentionSession.value
    if (!activated.value || !current) return null
    return current.ownerId === ownerId ? current : null
  })
  const mentionOpen = computed({
    get: () => mention.value !== null,
    set: value => {
      if (!value) mentionHide()
    },
  })

  return {
    open,
    anchor,
    title,
    presentation,
    scroll,
    narrow,
    renderedComp,
    renderedProps,
    overlayKey,
    command,
    commandOpen,
    commandHighlighted: highlighted,
    commandCommit: commit,
    mention,
    mentionOpen,
    mentionHighlighted,
    mentionCommit,
  }
}
