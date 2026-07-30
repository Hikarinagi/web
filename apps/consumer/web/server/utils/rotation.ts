function hashSeed(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seededShuffle<T>(arr: readonly T[], seed: string): T[] {
  const rand = mulberry32(hashSeed(seed))
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function pickN<T>(arr: readonly T[], n: number, seed: string): T[] {
  return seededShuffle(arr, seed).slice(0, n)
}

export function pickOne<T>(arr: readonly T[], seed: string): T | null {
  if (arr.length === 0) return null
  return seededShuffle(arr, seed)[0]!
}

function bucketIndex(bucketMinutes: number): number {
  return Math.floor(Date.now() / (bucketMinutes * 60_000))
}

// 时间桶种子:同一时间窗内稳定(可缓存、不跳),跨窗轮换;salt 让各 rail 独立打散。
// 以后要按用户轮换,把 session/device key 拼进 salt 即可,调用方不变。
export function bucketSeed(salt: string, bucketMinutes = 15): string {
  return `${bucketIndex(bucketMinutes)}:${salt}`
}

// 整窗平移取样:全池按 salt 稳定洗牌一次,再按桶号整段平移取 n 条。
// 相比 pickN(每窗独立洗牌、随机重叠),相邻窗口是相邻切片 → 零重叠直到绕回,
// 让「同一来源(如同一标签)每次访问取到尽量不同的一批」。同窗稳定、可缓存。
export function pickRotating<T>(
  arr: readonly T[],
  n: number,
  salt: string,
  bucketMinutes = 15,
): T[] {
  if (arr.length === 0) return []
  const pool = seededShuffle(arr, `pool:${salt}`)
  const offset = ((bucketIndex(bucketMinutes) * n) % pool.length) + pool.length
  const take = Math.min(n, pool.length)
  const out: T[] = []
  for (let i = 0; i < take; i += 1) out.push(pool[(offset + i) % pool.length]!)
  return out
}
