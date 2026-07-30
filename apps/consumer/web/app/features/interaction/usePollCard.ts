import type { EditorNode } from '@hikarinagi/editor-schema'
import {
  useContentSummaries,
  type PollCardSummary,
} from '~/components/hikari-content/composables/useContentSummaries'
import { usePoll, usePollView } from './usePoll'
import { usePollEdit } from './usePollEdit'

export function usePollCard(props: {
  node?: EditorNode
  poll: PollCardSummary | null
  interactive: boolean
}) {
  const summaries = useContentSummaries()
  const pollKey = computed(() => {
    if (props.poll) return props.poll.poll_key
    return typeof props.node?.attrs?.poll_key === 'string' ? props.node.attrs.poll_key : ''
  })
  const summary = computed(() => props.poll ?? summaries.value.polls.get(pollKey.value) ?? null)
  const livePoll = usePollView(pollKey.value, () => summary.value)
  const { vote, retract, busy } = usePoll()
  const { edit: editPoll } = usePollEdit()

  const canEdit = computed(() => props.interactive && !!livePoll.value?.can_edit)

  function openEdit() {
    if (livePoll.value) editPoll(livePoll.value)
  }

  const nodeQuestion = computed(() => String(props.node?.attrs?.question ?? ''))
  const nodeOptions = computed(() => {
    const opts = props.node?.attrs?.options
    return Array.isArray(opts) ? opts.filter((o): o is string => typeof o === 'string') : []
  })

  const question = computed(() => livePoll.value?.question || nodeQuestion.value)
  const total = computed(
    () => livePoll.value?.options.reduce((s, o) => s + (o.vote_count ?? 0), 0) ?? 0,
  )
  const mySet = computed(() => new Set(livePoll.value?.my_option_ids ?? []))
  const resultsVisible = computed(() => livePoll.value?.results_visible ?? false)
  const canVote = computed(() => props.interactive && !!livePoll.value && !livePoll.value.closed)

  const frozen = computed(() => {
    const p = livePoll.value
    return !!p && !p.allow_change && p.my_option_ids.length > 0
  })
  const atMax = computed(() => {
    const p = livePoll.value
    return (
      !!p && p.allow_multiple && p.max_choices != null && p.my_option_ids.length >= p.max_choices
    )
  })

  const rows = computed(() => {
    if (livePoll.value) {
      return livePoll.value.options.map(o => {
        const selected = mySet.value.has(o.id)
        return {
          key: String(o.id),
          id: o.id as number | null,
          label: o.label,
          selected,
          disabled: !canVote.value || busy.value || frozen.value || (atMax.value && !selected),
          percent:
            resultsVisible.value && o.vote_count != null
              ? total.value > 0
                ? Math.round((o.vote_count / total.value) * 100)
                : 0
              : null,
        }
      })
    }
    return nodeOptions.value.map((label, i) => ({
      key: `n${i}`,
      id: null as number | null,
      label,
      selected: false,
      disabled: true,
      percent: null as number | null,
    }))
  })

  async function pick(optionId: number | null) {
    const p = livePoll.value
    if (!canVote.value || busy.value || !p || optionId == null || frozen.value) return
    if (p.allow_multiple) {
      const next = new Set(p.my_option_ids)
      if (next.has(optionId)) next.delete(optionId)
      else {
        if (p.max_choices != null && next.size >= p.max_choices) return
        next.add(optionId)
      }
      if (next.size === 0) await retract(pollKey.value, p.id)
      else await vote(pollKey.value, p.id, [...next])
    } else if (mySet.value.has(optionId)) {
      await retract(pollKey.value, p.id)
    } else {
      await vote(pollKey.value, p.id, [optionId])
    }
  }

  const voters = computed(() => livePoll.value?.voters ?? [])
  const footerText = computed(() => {
    const p = livePoll.value
    if (!p) return '发布后可参与投票'
    const parts: string[] = []
    if (p.results_visible) {
      parts.push(`${p.voter_count ?? 0} 人投票`)
    } else {
      if (!p.anonymous) parts.push('公开投票')
      parts.push('投票后查看结果')
    }
    if (p.allow_multiple) parts.push(p.max_choices ? `最多选 ${p.max_choices} 项` : '可多选')
    if (!p.allow_change) parts.push('不能修改')
    if (p.closed) parts.push('投票已结束')
    return parts.join('·')
  })

  const hasContent = computed(() => question.value.length > 0 && rows.value.length > 0)

  return {
    canEdit,
    openEdit,
    question,
    rows,
    resultsVisible,
    canVote,
    pick,
    voters,
    footerText,
    hasContent,
  }
}
