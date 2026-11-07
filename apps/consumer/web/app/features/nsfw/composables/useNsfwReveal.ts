export function useNsfwReveal() {
  const revealed = useState<string[]>('nsfw-revealed', () => [])

  function reveal(sources: string[]) {
    revealed.value = [...new Set([...revealed.value, ...sources])]
  }

  function conceal(sources: string[]) {
    revealed.value = revealed.value.filter(source => !sources.includes(source))
  }

  return { revealed, reveal, conceal }
}
