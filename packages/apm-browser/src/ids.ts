const HEX = '0123456789abcdef'

export function randomHex(bytes: number): string {
  const buffer = new Uint8Array(bytes)
  crypto.getRandomValues(buffer)
  let out = ''
  for (const byte of buffer) out += HEX[byte >> 4]! + HEX[byte & 15]!
  return out
}

export function newTraceId(): string {
  return randomHex(16)
}

export function newSpanId(): string {
  return randomHex(8)
}

export function traceparent(traceId: string, spanId: string, sampled: boolean): string {
  return `00-${traceId}-${spanId}-${sampled ? '01' : '00'}`
}

export function nanos(ms: number): string {
  const whole = Math.floor(ms)
  const fraction = Math.round((ms - whole) * 1_000_000)
  return (BigInt(whole) * 1_000_000n + BigInt(fraction)).toString()
}
