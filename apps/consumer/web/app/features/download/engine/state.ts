import type { RunRecord } from './types'

const DB_NAME = 'hikari-download'
const STORE = 'runs'

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'taskId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function transact<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const db = await open()
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = work(db.transaction(STORE, mode).objectStore(STORE))
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export async function loadRun(taskId: number): Promise<RunRecord | null> {
  try {
    return (await transact('readonly', store => store.get(taskId))) ?? null
  } catch {
    return null
  }
}

export async function saveRun(record: RunRecord): Promise<void> {
  await transact('readwrite', store => store.put({ ...record, updatedAt: Date.now() })).catch(
    () => undefined,
  )
}

export async function deleteRun(taskId: number): Promise<void> {
  await transact('readwrite', store => store.delete(taskId)).catch(() => undefined)
}

export async function listRuns(): Promise<RunRecord[]> {
  try {
    return await transact('readonly', store => store.getAll())
  } catch {
    return []
  }
}
