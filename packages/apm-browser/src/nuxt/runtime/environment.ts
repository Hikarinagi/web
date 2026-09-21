export function environmentOf(hostname: string): string {
  const host = hostname.toLowerCase()
  if (
    host === '' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.') ||
    host.endsWith('.local')
  ) {
    return 'local'
  }
  if (host.startsWith('staging.') || host.startsWith('staging-')) return 'staging'
  return 'production'
}
