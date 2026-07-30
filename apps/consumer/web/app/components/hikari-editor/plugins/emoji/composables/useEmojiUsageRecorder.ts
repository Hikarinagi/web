import { invalidateRecentCache } from './useEmojiRecent'

const DEBOUNCE_MS = 2_000
const recentlyRecorded = new Map<number, number>()

export function recordEmojiUsage(emojiId: number): void {
  const now = Date.now()
  const last = recentlyRecorded.get(emojiId) ?? 0
  if (now - last < DEBOUNCE_MS) return
  recentlyRecorded.set(emojiId, now)
  void hikariRequest<'/api/v3/emoji/usage', 'post'>('/api/v3/emoji/usage', {
    method: 'post',
    body: { emoji_id: emojiId },
    toast: false,
  })
    .then(() => invalidateRecentCache())
    .catch(() => {
      recentlyRecorded.delete(emojiId)
    })
}
