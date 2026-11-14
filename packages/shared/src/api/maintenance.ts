export interface SiteMaintenanceDetails {
  title?: string
  ends_at?: string | null
  telegram_url?: string
  updated_at?: string
}

export interface SiteMaintenanceStatus {
  enabled: boolean
  title: string
  message: string
  ends_at: string | null
  retry_after_seconds: number
  telegram_url: string
  updated_at: string | null
  server_time: string
}
