const RANK_TONES = ['text-amber-400', 'text-neutral-400', 'text-amber-700']

export function rankTone(index: number) {
  return RANK_TONES[index] ?? 'text-faint'
}
