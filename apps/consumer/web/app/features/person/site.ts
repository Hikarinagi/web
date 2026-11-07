const WEBSITE_LABELS: Record<string, string> = {
  OFFICIAL_SITE: '本人官网',
  OFFICIAL_ACCOUNT: '官方账号',
  AGENCY_PAGE: '所属事务所',
}

export const websiteLabel = (code: string) => WEBSITE_LABELS[code] ?? code
