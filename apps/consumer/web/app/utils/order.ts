export function sortByOrder<T extends string>(values: readonly T[], order: readonly string[]): T[] {
  const rank = (value: string) => {
    const index = order.indexOf(value)
    return index === -1 ? order.length : index
  }
  return [...values].sort((a, b) => rank(a) - rank(b))
}
