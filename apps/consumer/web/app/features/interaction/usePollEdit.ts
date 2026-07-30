import type { PollCardSummary } from '~/components/hikari-content/composables/useContentSummaries'
import { usePoll } from './usePoll'
import { usePollEditor } from './usePollEditor'

export function usePollEdit() {
  const { open } = usePollEditor()
  const { apply } = usePoll()

  function edit(poll: PollCardSummary, onSaved?: (res: PollCardSummary) => void) {
    const locked = !poll.can_edit_options
    open({
      mode: 'edit',
      initial: {
        question: poll.question,
        options: poll.options.map(o => o.label),
        allow_multiple: poll.allow_multiple,
        max_choices: poll.max_choices,
        anonymous: poll.anonymous,
        allow_change: poll.allow_change,
        closes_at: poll.closes_at,
      },
      locked,
      onSave: async def => {
        const body = locked
          ? {
              question: def.question,
              closes_at: def.closes_at,
              anonymous: def.anonymous,
              allow_change: def.allow_change,
            }
          : {
              question: def.question,
              allow_multiple: def.allow_multiple,
              max_choices: def.max_choices,
              anonymous: def.anonymous,
              allow_change: def.allow_change,
              closes_at: def.closes_at,
              options: def.options.map(label => ({ label })),
            }
        const res = await hikariRequest<'/api/v3/polls/{id}', 'patch'>('/api/v3/polls/{id}', {
          method: 'patch',
          path: { id: poll.id },
          body,
        })
        apply(poll.poll_key, res)
        onSaved?.(res)
      },
    })
  }

  return { edit }
}
