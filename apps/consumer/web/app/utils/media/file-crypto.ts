export function createFileKey() {
  return btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(64))))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function decryptFile(id: string, encodedKey: string, encrypted: ArrayBuffer) {
  if (encrypted.byteLength < 28) throw new Error('文件不完整，请重新加载')
  if (!/^[A-Za-z0-9_-]{85}[AQgw]$/.test(encodedKey)) throw new Error('文件校验失败，请重新加载')
  const payload = Uint8Array.from(
    atob(encodedKey.replace(/-/g, '+').replace(/_/g, '/') + '=='),
    character => character.charCodeAt(0),
  )
  const bytes = payload.slice(0, 32).map((value, index) => value ^ payload[index + 32]!)
  const key = await crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, ['decrypt'])
  try {
    return await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encrypted.slice(0, 12),
        additionalData: new TextEncoder().encode(id),
        tagLength: 128,
      },
      key,
      encrypted.slice(12),
    )
  } catch {
    throw new Error('文件校验失败，请重新加载')
  }
}
