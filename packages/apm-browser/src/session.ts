import { randomHex } from './ids.js'

export const SESSION_STORAGE_KEY = 'hikari_apm_session'
export const SESSION_IDLE_MS = 30 * 60 * 1000

export type SessionStorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

interface StoredSession {
  id: string
  last: number
}

export class Session {
  private current: StoredSession

  constructor(
    private readonly storage: SessionStorageLike | null,
    private readonly now: () => number,
  ) {
    this.current = this.load() ?? this.fresh()
    this.persist()
  }

  get id(): string {
    return this.touch()
  }

  touch(): string {
    const at = this.now()
    if (at - this.current.last > SESSION_IDLE_MS) this.current = this.fresh()
    this.current.last = at
    this.persist()
    return this.current.id
  }

  private fresh(): StoredSession {
    return { id: randomHex(8), last: this.now() }
  }

  private load(): StoredSession | null {
    try {
      const raw = this.storage?.getItem(SESSION_STORAGE_KEY)
      if (!raw) return null
      const parsed = JSON.parse(raw) as Partial<StoredSession>
      if (typeof parsed.id !== 'string' || typeof parsed.last !== 'number') return null
      if (this.now() - parsed.last > SESSION_IDLE_MS) return null
      return { id: parsed.id, last: parsed.last }
    } catch {
      return null
    }
  }

  private persist(): void {
    try {
      this.storage?.setItem(SESSION_STORAGE_KEY, JSON.stringify(this.current))
    } catch {
      /* storage unavailable */
    }
  }
}
